# Goal 15 Coding Prompt

Implement only the approved Goal 15 scope:

- Use the existing `LoggingService` as the routing sink.
- Do not add a message broker, durable event table, Prisma migration, deployment, or external Auth call.
- Add a guarded internal endpoint for Auth conversion-link event recording.
- Do not expose or log raw contact values, confirmation tokens, raw messages, private source URL details, metadata values, JWTs, session tokens, or raw consent source values.
- Keep tests synthetic.
