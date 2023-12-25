import fg from 'fast-glob'
import fs from 'node:fs'
import { rename } from 'node:fs/promises'

import nodePath from 'node:path'
const { resolve, dirname } = nodePath

export const file = {
	exists: fs.existsSync,
	find: x => fg.globSync(resolve(x), { onlyFiles: true }),
	read: x => fs.readFileSync(x).toString(),
	rename: async (xs, by) => {
		let renaming = []
		for (let x of xs) renaming.push(rename(x, by(x)))
		await Promise.all(renaming)
	}
}

export const path = Object.assign(resolve, {
	node: nodePath,
	fromUrl: x => new URL(x, 'http://localhost').pathname,
	isDir: x => fs.existsSync(x) &&
		fs.statSync(x).isDirectory(),
	relative: (sourcefile, x) =>
		resolve(dirname(sourcefile), x),
})

export const remove = (text, from) =>
	from.replace(text, '')
