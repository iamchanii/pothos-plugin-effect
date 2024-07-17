# Migration from v1

## Breaking API Changes

### Renamed options

The name of the plugin option field has been changed to `effect` to be more consistent with other offical Pothos plugins.

```diff
const builder = new SchemaBuilder<{}>({
-  effectOptions: {...}
+  effect: {...}
})
```
