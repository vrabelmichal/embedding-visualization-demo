#!/usr/bin/env python3
import http.server
import socketserver

PORT = 8999

LOCAL_BASE = "http://localhost:5174"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Embedding Viewer Proxy</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
  <div class="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Embedding Viewer</h1>
    <p class="text-gray-600 mb-6">Paste a URL from embedding.michalvrabel.sk below. It will be converted to a local URL with the same parameters.</p>
    <form id="urlForm" class="space-y-4">
      <div>
        <label for="urlInput" class="block text-sm font-medium text-gray-700 mb-1">URL</label>
        <textarea
          id="urlInput"
          name="url"
          rows="3"
          class="w-full rounded-lg border border-gray-300 p-3 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
          placeholder="https://embedding.michalvrabel.sk/?base=..."
          required
        ></textarea>
      </div>
      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        Translate
      </button>
    </form>
    <div id="result" class="mt-6 hidden space-y-4">
      <div>
        <p class="text-sm text-gray-500 mb-1">Embedding Page URL:</p>
        <p id="resultLink" class="text-blue-600 break-all font-mono text-sm bg-gray-50 p-3 rounded border"></p>
      </div>
      <div id="fileLinks" class="hidden space-y-3"></div>
      <a
        id="openButton"
        href="#"
        class="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Open URL
      </a>
    </div>
  </div>
  <script>
    const LOCAL_BASE = "__LOCAL_BASE__";
    const REMOTE_HOSTS = [
      "https://embedding.michalvrabel.sk",
      "https://des-lsb-zoobot-analysis.michalvrabel.sk"
    ];
    const LOCAL_DATA_HOST = "http://localhost:8085";
    const LOCAL_APP_HOST = "http://localhost:5174";

    function replaceHost(base, host) {
      for (const r of REMOTE_HOSTS) {
        if (base.startsWith(r)) {
          return base.replace(r, host);
        }
      }
      return base;
    }

    function replaceHosts(base) {
      return replaceHost(base, LOCAL_DATA_HOST);
    }

    function replaceHostsApp(base) {
      return replaceHost(base, LOCAL_APP_HOST);
    }

    document.getElementById("urlForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const raw = document.getElementById("urlInput").value.trim();
      try {
        const url = new URL(raw);
        const params = url.searchParams;
        const files = ["base", "emb", "cfg"];
        for (const key of files) {
          const val = params.get(key);
          if (val) {
            params.set(key, replaceHosts(val));
          }
        }
        const target = LOCAL_BASE + window.location.pathname + "?" + params.toString();
        document.getElementById("resultLink").textContent = target;
        document.getElementById("openButton").href = target;

        const fileDiv = document.getElementById("fileLinks");
        fileDiv.innerHTML = "";
        let hasFiles = false;

        const _base_key = files[0];
        const _base_val = url.searchParams.get(_base_key);
        var _base_appUrl = "";
        if (_base_val) {
          _base_appUrl = replaceHostsApp(_base_val);
          const row = document.createElement("div");
          row.innerHTML = `<p class="text-sm text-gray-500 mb-1">${_base_key.toUpperCase()} URL (localhost:5174):</p>
            <p class="text-blue-600 break-all font-mono text-sm bg-gray-50 p-3 rounded border">${_base_appUrl}</p>`;
          fileDiv.appendChild(row);
          hasFiles = true;
        }
        
        for (const key of files.slice(1)) {
          const val = url.searchParams.get(key);
          if (val) {
            const appUrl = replaceHostsApp(val);
            const row = document.createElement("div");
            row.innerHTML = `<p class="text-sm text-gray-500 mb-1">${key.toUpperCase()} URL (localhost:5174):</p>
              <p class="text-blue-600 break-all font-mono text-sm bg-gray-50 p-3 rounded border">${_base_appUrl}${appUrl}</p>`;
            fileDiv.appendChild(row);
            hasFiles = true;
          }
        }
        fileDiv.classList.toggle("hidden", !hasFiles);
        document.getElementById("result").classList.remove("hidden");
      } catch (err) {
        alert("Invalid URL: " + err.message);
      }
    });
  </script>
</body>
</html>"""


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path in ("/", "/index.html"):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                html = HTML_TEMPLATE.replace("__LOCAL_BASE__", LOCAL_BASE)
                self.wfile.write(html.encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()
        except BrokenPipeError:
            pass


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = "http://localhost:{}".format(PORT)
        print("Serving at {}".format(url))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
