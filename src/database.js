import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf8')
            .then(data => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist()
            })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    select(table, search) {
        let data = this.#database[table] ?? []

        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if (rowIndex > -1) {
            const newData = this.#database[table][rowIndex]
            let dataChanged = false
            if (data.title && data.title != newData.title) {
                newData.title = data.title
                dataChanged = true
            }
            if (data.description && data.description != newData.description) {
                newData.description = data.description
                dataChanged = true
            }
            if (data.completed_at) {
                let newCompleted = newData.completed_at ? null : data.completed_at
                newData.completed_at = newCompleted
                dataChanged = true
            }
            if (dataChanged) {
                newData.updated_at = data.updated_at
                this.#database[table][rowIndex] = newData
                this.#persist()
            }
        }

        return rowIndex
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
        }

        return rowIndex
    }
}