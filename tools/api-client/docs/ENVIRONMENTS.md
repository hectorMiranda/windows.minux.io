# Environments & variables

An environment is a named bag of `{{variables}}`. The active environment's
values are interpolated into the URL, headers, params and body at send time.
Dynamic variables resolve per-send: `{{$uuid}}`, `{{$timestamp}}`,
`{{$isoTimestamp}}`, `{{$randomInt}}`, `{{$guid}}`, `{{$randomColor}}`,
`{{$counter}}`.
