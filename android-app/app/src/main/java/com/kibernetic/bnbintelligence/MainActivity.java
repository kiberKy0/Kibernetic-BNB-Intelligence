package com.kibernetic.bnbintelligence;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String HOME = "https://kibernetic-bnb-intelligence.vercel.app/";
    private static final String HOST = "kibernetic-bnb-intelligence.vercel.app";
    private static final int DARK = Color.rgb(5, 11, 20);
    private static final int PANEL = Color.rgb(15, 33, 54);
    private WebView web;
    private ProgressBar spinner;
    private LinearLayout errorPanel;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().setStatusBarColor(DARK);
        getWindow().setNavigationBarColor(DARK);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(DARK);
        setContentView(root);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(),
                    insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(),
                    insets.getSystemWindowInsetBottom());
            }
            return insets;
        });

        FrameLayout surface = new FrameLayout(this);
        root.addView(surface, new LinearLayout.LayoutParams(-1, 0, 1f));
        web = new WebView(this);
        surface.addView(web, new FrameLayout.LayoutParams(-1, -1));
        configureWeb();
        spinner = new ProgressBar(this);
        surface.addView(spinner, new FrameLayout.LayoutParams(dp(42), dp(42), Gravity.CENTER));

        errorPanel = new LinearLayout(this);
        errorPanel.setOrientation(LinearLayout.VERTICAL);
        errorPanel.setGravity(Gravity.CENTER);
        errorPanel.setPadding(dp(24), dp(24), dp(24), dp(24));
        errorPanel.setBackgroundColor(DARK);
        TextView title = new TextView(this);
        title.setText(getString(R.string.offline));
        title.setTextSize(18);
        title.setTextColor(Color.WHITE);
        title.setGravity(Gravity.CENTER);
        errorPanel.addView(title);
        Button retry = button("Riprova", this::openHome);
        LinearLayout.LayoutParams retryParams = new LinearLayout.LayoutParams(-1, dp(48));
        retryParams.topMargin = dp(20);
        errorPanel.addView(retry, retryParams);
        surface.addView(errorPanel, new FrameLayout.LayoutParams(-1, -1));
        errorPanel.setVisibility(View.GONE);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setBackgroundColor(PANEL);
        root.addView(bar, new LinearLayout.LayoutParams(-1, dp(54)));
        addAction(bar, "Home", this::openHome);
        addAction(bar, "Aggiorna", () -> { errorPanel.setVisibility(View.GONE); web.reload(); });
        addAction(bar, "Condividi", this::shareSite);
        if (saved == null) openHome(); else web.restoreState(saved);
    }

    private void configureWeb() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setSupportMultipleWindows(false);
        s.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        WebView.setWebContentsDebuggingEnabled(false);
        web.setBackgroundColor(DARK);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri uri = request.getUrl();
                if ("https".equalsIgnoreCase(uri.getScheme()) &&
                    HOST.equalsIgnoreCase(uri.getHost())) return false;
                if ("https".equalsIgnoreCase(uri.getScheme()) ||
                    "http".equalsIgnoreCase(uri.getScheme())) {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                }
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                spinner.setVisibility(View.VISIBLE);
                errorPanel.setVisibility(View.GONE);
            }
            @Override public void onPageFinished(WebView view, String url) {
                spinner.setVisibility(View.GONE);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest req,
                                                  WebResourceError err) {
                if (req.isForMainFrame()) showError();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest req,
                android.webkit.WebResourceResponse response) {
                if (req.isForMainFrame() && response.getStatusCode() >= 400) showError();
            }
        });
    }
    private void showError() {
        spinner.setVisibility(View.GONE);
        errorPanel.setVisibility(View.VISIBLE);
    }
    private void openHome() {
        errorPanel.setVisibility(View.GONE);
        web.loadUrl(HOME);
    }
    private void shareSite() {
        Intent share = new Intent(Intent.ACTION_SEND);
        share.setType("text/plain");
        share.putExtra(Intent.EXTRA_SUBJECT, "Kibernetic BNB Intelligence");
        share.putExtra(Intent.EXTRA_TEXT, HOME);
        startActivity(Intent.createChooser(share, "Condividi"));
    }
    private void addAction(LinearLayout bar, String label, Runnable action) {
        bar.addView(button(label, action), new LinearLayout.LayoutParams(0, dp(54), 1f));
    }
    private Button button(String text, Runnable action) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setTextColor(Color.WHITE);
        b.setTextSize(13);
        b.setBackgroundColor(PANEL);
        b.setOnClickListener(v -> action.run());
        return b;
    }
    private int dp(int value) {
        return Math.round(getResources().getDisplayMetrics().density * value);
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        web.saveState(state);
        super.onSaveInstanceState(state);
    }
    @Override public void onBackPressed() {
        if (errorPanel.getVisibility() != View.VISIBLE && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }
}
