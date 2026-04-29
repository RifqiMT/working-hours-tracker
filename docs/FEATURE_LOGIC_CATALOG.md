# Feature Logic Catalog

## Profile Access Logic

- Actions that mutate or expose profile-sensitive data may require unlock.
- Password updates require current password verification for protected profiles.

## Save and Sync Logic

- Local state changes queue autosave requests.
- Startup performs remote fetch and merge to maintain continuity.

## Voice Parsing Logic

- Transcript is normalized into canonical field mapping.
- User reviews parsed result before applying to entry form.

## Export Logic

- Export actions build payload snapshots from current profile data.
- Security and profile access constraints apply before export finalization.

## Localization Logic

- UI labels are driven by i18n key resolution.
- Manual locale packs must include new feature strings before release.
