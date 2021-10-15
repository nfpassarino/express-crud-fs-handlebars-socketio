const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

module.exports = class Container {

    constructor(filePath, objects, lastId) {
        this.filePath = filePath;
        this.objects = objects;
        this.lastId = lastId;
    }
    
    static async initialize(fileName = '') {
        const filePath = path.resolve(fileName);
        if (fs.existsSync(filePath)) {
            const data = await fsPromises.readFile(filePath, 'utf-8');
            const objects = JSON.parse(data).objects;
            const lastId = objects.slice(-1)[0]?.id || 0;
            return new Container(filePath, objects, lastId);
        } else {
            await fsPromises.writeFile(filePath, JSON.stringify({ objects: [] }, null, 2));
            return new Container(filePath, [], 0);
        }
    }

    async save(obj) {
        if(typeof obj === 'object') {
            obj['id'] = ++this.lastId;
            this.objects.push(obj);
            await fsPromises.writeFile(this.filePath, JSON.stringify({ objects: this.objects }, null, 2));
            return obj.id;
        }
        return null;
    }

    async updateById(id, newObject) {
        if(typeof id === 'number' && this.objects.length > 0 && id <= this.objects.length) {
            this.objects[id - 1] = {
                ...newObject,
                "id": id
            };
            await fsPromises.writeFile(this.filePath, JSON.stringify({ objects: this.objects }, null, 2));
            return id;
        }
        return null;
    }

    getById(id) {
        if(typeof id === 'number' && this.objects.length > 0 && id >0 && id <= this.objects.length) {
            return this.objects[id - 1];
        } else {
            return null;
        }
    }

    getAll() {
        return this.objects;
    }

    async deleteById(n) {
        if(typeof n === 'number') {
            if(n <= this.objects.length) {
                let newArray = this.objects.filter(obj => obj !== this.objects[n - 1]);
                await fsPromises.writeFile(this.filePath, JSON.stringify({ objects: newArray }, null, 2));
            }
        }
    }

    async deleteAll() {
        await fsPromises.writeFile(this.filePath, JSON.stringify({ objects: [] }, null, 2));
    }

}
