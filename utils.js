import fg from 'fast-glob'
import fs from 'node:fs'
import { rename } from 'node:fs/promises'
import { resolve } from 'node:path'

export const file = {
	exists: fs.existsSync,
	find: x => fg.globSync(resolve(x), { onlyFiles: true }),
	read: x => fs.readFileSync(x),
	rename: async (xs, by) => {
		let renaming = []
		for (let x of xs) renaming.push(rename(x, by(x)))
		await Promise.all(renaming)
	}
}

export const path = Object.assign(resolve, {
	fromUrl: x => new URL(x, 'http://localhost')
		.pathname.replace(/\/$/, ''),
	isDir: x => fs.existsSync(x) &&
		fs.statSync(x).isDirectory(),
})
