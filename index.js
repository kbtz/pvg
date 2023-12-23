import middleware from './middleware.js'
import bundler from './bundler.js'
import transformIndexHtml from './transformer.js'
import { file } from './utils.js'

/**
 * @returns {import('vite').Plugin[]}
 */
function pvg({ pattern }) {
	let
		input = file.find(pattern),
		building = false

	return [{
		name: 'pvg',
		config(config, { command }) {
			building = command == 'build'
			
			if (building)
				input = input.map(x => x + '.html')
			
			return { build: { rollupOptions: { input } } }
		},
		resolveId(id) {
			console.log('R', id)
			return null
		},
		transform(content, id) {
			console.log('T', id)
			
			if (id.endsWith('.pug'))
				content = { code: `console.debug("[pvg] watching ${id} for changes")` }
			
			return content
		},
		configResolved: (c) => {
			console.log('resolved')
			console.log(c.build.rollupOptions.input)
			
		},
		buildStart: async () => {
			console.log('start')
			if(!building || !input.length) return
			const realInput = input.map(x => x.replace('.html', ''))
			await file.rename(realInput, f => f + '.html')
		},
		buildEnd: async () => {
			if(!building || !input.length) return
			await file.rename(input, x => x.replace('.html', ''))
		},
		transformIndexHtml
	}, bundler, middleware]
}

pvg.match = pattern => pvg({ pattern })

export default pvg
