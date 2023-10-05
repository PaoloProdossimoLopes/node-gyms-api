import { PrismaUsersRepository } from '@src/repositories/prisma-users-repository'
import { EmailAlreadyExistsError } from '@src/use-cases/errors/email-already-exists-error'
import { RegistgerUseCase } from '@src/use-cases/register'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const userRequest = userSchema.parse(request.body)

  try {
    const repository = new PrismaUsersRepository()
    const useCase = new RegistgerUseCase(repository)
    await useCase.handle(userRequest)
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError)
      return reply.status(409).send({
        error: 'User already exists error',
        messsage: error.message,
      })

    throw error
  }

  return reply.status(201).send()
}
