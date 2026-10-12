"""Read-only audit of the visible 250-asset catalog and its 30-day chart API.

No credentials. At most two requests in flight, three seconds between starts.
External availability is a point-in-time observation, never a reliability guarantee.
"""
import concurrent.futures, datetime, json, pathlib, threading, time, urllib.request, urllib.error, urllib.parse, argparse

ROOT=pathlib.Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('catalog',type=pathlib.Path,help='JSON catalog snapshot with items');args=parser.parse_args()
catalog=json.loads(args.catalog.read_text())
items=catalog.get('items',[])
lock=threading.Lock(); next_start=0; results={}; done=0; stopped=threading.Event()
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
def check(asset):
    global next_start
    with lock:
        wait=max(0,next_start-time.monotonic());next_start=max(next_start,time.monotonic())+3
    if wait: time.sleep(wait)
    row={'id':asset.get('id'),'symbol':asset.get('symbol'),'name':asset.get('name'),'catalog_price':asset.get('price'),'bsc_address_verified':False,'chart_status':'not_checked'}
    if stopped.is_set():
        row['chart_status']='not_checked_rate_limit';return row
    url='https://kibernetic-bnb-intelligence.vercel.app/api/coingecko?type=coin_chart&id='+urllib.parse.quote(asset['id'])+'&days=30'
    begin=time.monotonic()
    try:
        with urllib.request.urlopen(url,timeout=18) as response:data=json.load(response)
        points=data.get('points',[]);valid=all(isinstance(p.get('t'),(int,float)) and isinstance(p.get('p'),(int,float)) and p['p']>0 for p in points)
        times=[p['t'] for p in points]
        row.update(chart_status='available' if len(points)>=3 and valid and times==sorted(set(times)) else 'insufficient_or_invalid',points=len(points),source=data.get('source'),from_ms=times[0] if times else None,to_ms=times[-1] if times else None)
    except urllib.error.HTTPError as error:
        try:body=json.loads(error.read())
        except Exception:body={}
        if body.get('upstreamStatus')==429: stopped.set()
        row.update(chart_status='provider_error',http_status=error.code,upstream_status=body.get('upstreamStatus'),error=str(body.get('error','API failed'))[:180])
    except Exception as error:row.update(chart_status='request_failed',error=str(error)[:180])
    row['duration_seconds']=round(time.monotonic()-begin,2)
    return row
def save():
    payload={'started_at':started,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':catalog.get('scope'),'catalog_count':len(items),'checked':sum(x['chart_status']!='not_checked_rate_limit' for x in results.values()),'complete':len(results)==len(items) and not stopped.is_set(),'stop_reason':'provider_rate_limit' if stopped.is_set() else None,'notes':['Only the 250 assets returned by this catalog snapshot, not all BNB Chain contracts.','Charts tested at 30 days; other periods and every asset detail/pool/security endpoint are not exhaustively tested.','No contract address is inferred from ecosystem membership.'],'assets':[results.get(x['id'],{'id':x['id'],'symbol':x.get('symbol'),'name':x.get('name'),'chart_status':'pending'}) for x in items]}
    (ROOT/'docs/catalog-audit-2026-10-12.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
save()
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
    jobs=[executor.submit(check,x) for x in items]
    for job in concurrent.futures.as_completed(jobs):
        row=job.result();results[row['id']]=row;done+=1;save()
        if done%10==0 or done==len(items):print(json.dumps({'checked':done,'total':len(items),'available':sum(x['chart_status']=='available' for x in results.values())}),flush=True)
