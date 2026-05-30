# Collection runner

The runner executes every request in a collection sequentially, threading an
environment object through each step so a test script can `mx.env.set(...)` a
value the next request consumes. It reports per-request status and aggregated
test pass/fail counts.
