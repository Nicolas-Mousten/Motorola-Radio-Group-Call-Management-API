# Motorola-Radio-Group-Call-Management-API
Job task for Motorola Solutions



Make sure this is in the OpenAPI tree:
UserRequest:
      type: object
      required:
        - userId
      properties:
        userId:
          type: string
          description: The unique identifier for the user.
        priority:
          type: integer
          description: Priority of the request. Higher numbers get higher priority.
          example: 5