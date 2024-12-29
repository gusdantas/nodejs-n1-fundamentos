import { Database } from './database.js'
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if (!title) {
                return res
                    .writeHead(400)
                    .end(JSON.stringify({ message: 'title is required' }))
            }

            if (!description) {
                return res
                    .writeHead(400)
                    .end(JSON.stringify({ message: 'description is required' }))
            }

            const date = new Date().toISOString()

            const user = {
                id: randomUUID(),
                title,
                description,
                created_at: date,
                updated_at: date,
                completed_at: null
            }

            database.insert('tasks', user)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const users = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return res.end(JSON.stringify(users))
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if (!title && !description) {
                return res
                    .writeHead(400)
                    .end(JSON.stringify({ message: 'title or description are required' }))
            }

            const date = new Date().toISOString()

            let index = database.update('tasks', id, {
                title,
                description,
                updated_at: date
            })

            let codeReturn = index > -1 ? 204 : 404

            return res.writeHead(codeReturn).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            let index = database.delete('tasks', id)

            let codeReturn = index > -1 ? 204 : 404

            return res.writeHead(codeReturn).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params
            const date = new Date().toISOString()

            let index = database.update('tasks', id, {
                updated_at: date,
                completed_at: date
            })

            let codeReturn = index > -1 ? 204 : 404

            return res.writeHead(codeReturn).end()
        }
    }
]