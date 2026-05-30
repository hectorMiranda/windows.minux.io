// Go (net/http) code generator
export function gen(r) {
  let s = `package main\n\nimport (\n  \"fmt\"\n  \"net/http\"\n  \"strings\"\n  \"io\"\n)\n\nfunc main() {\n`;
  s += `  body := strings.NewReader(${JSON.stringify(r.body)})\n`;
  s += `  req, _ := http.NewRequest(${JSON.stringify(r.method)}, ${JSON.stringify(r.url)}, body)\n`;
  for (const [k, v] of Object.entries(r.headers)) s += `  req.Header.Set(${JSON.stringify(k)}, ${JSON.stringify(v)})\n`;
  s += `  res, _ := http.DefaultClient.Do(req)\n  defer res.Body.Close()\n  out, _ := io.ReadAll(res.Body)\n  fmt.Println(string(out))\n}`;
  return s;
}
