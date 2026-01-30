# Agent Notes

Client refactor ideas (vercel composition patterns):
- architecture-compound-components + state-lift-state: replace `ButtonDialog` + `useDialog` with `Dialog.Root/Trigger/Content` so `open/handleOpen/handleClose/buttonText/variant` props disappear.
- patterns-explicit-variants: `ImageUpload`, `EditButton`, `DeleteButton` -> explicit dialog variants composing the shared Dialog pieces.
- architecture-avoid-boolean-props + patterns-explicit-variants: split `Images` into `ImagesGrid` + `Images.Loading/Error/Empty` (or `ImagesState`) instead of `isLoading/error` booleans.
- state-context-interface + state-decouple-implementation: reshape `AuthContext`/`NotificationContext` to `{ state, actions, meta }` so providers own state, consumers use actions.
- architecture-compound-components: extract shared menu item rendering into `Menu.List`/`Menu.Item` with context to remove duplicate logic in `MenuDesktop` and `DrawerMenu`.
