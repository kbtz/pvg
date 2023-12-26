import yaml from 'yaml'
import stylus from 'stylus'
import { file, path } from './utils.js'

stylus.functions.load = stylusLoader

export function pugLoader(content, filepath) {
	const loadCall = /\+load\(([^,)]+)(,\s*{([^}]+)}\s*)?\)/gm;

	let match, locals
	while ((match = loadCall.exec(content)) !== null) {
		const
			[line, path, _, fields] = match,
			data = loadFile(filepath, path)

		if (!data) {
			console.warn(`[pvg] Could not load data from ${path} (${filepath})`)
			continue
		}

		locals = {}
		if (fields) {
			const names = fields.split(',').map(f => f.trim())
			for (let name of names)
				locals[name] = data[name]
		} else locals = data
	}

	return locals
}

function stylusLoader(arg, intoScope = true) {
	if (intoScope.val === false) intoScope = false

	const
		data = loadFile(arg.filename, arg.string),
		vars = this.stack.currentFrame.scope.locals
	
	if (!data) {
		console.warn(`[pvg] Could not load data from ${arg.string} (${arg.filename})`)
		return
	}

	// for storing the result in a single stylus variable
	if (typeof data != 'object' || Array.isArray(data) || !intoScope)
		return stylus.utils.coerce(data, true)

	// or each object key as its own variable
	for (let key in data)
		vars[key] = stylus.utils.coerce(data[key], true)
}

// TODO support lookup for js, json and csv
function loadFile(sourcefile, filepath) {
	filepath = path.relative(sourcefile, filepath + '.yaml')
	if (!file.exists(filepath)) return

	let
		content = file.read(filepath, 'utf-8'),
		extension = path.node.extname(filepath)

	switch (extension) {
		case '.yaml':
			content = content.replace(/^(\t+)/gm, m => "  ".repeat(m.length))
			return yaml.parse(content)
		default:
			console.warn(`[pvg] Loading data from ${extension} files is not supported`)
			return {}
	}
}
