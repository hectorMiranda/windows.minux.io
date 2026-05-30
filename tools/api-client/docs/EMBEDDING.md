# Embedding in Minux

API Studio is a static web app, so the Minux desktop control center embeds it
in a WebView2 control and points it at the bundled `index.html`. State persists
through the WebView's `localStorage`. No server is required.
