import './data-loader.js'
import { file, remove } from './utils.js'

import transformer from './transformer.js'
import middleware from './middleware.js'
import bundler from './bundler.js'

/**
 * @returns {import('vite').Plugin[]}
 */
function pvg({ match }) {
	let
		/** @type import('vite').UserConfig */
		config, building = false,
		input = file.find(match)

	return [{
		name: 'pvg',
		config(config, { command }) {
			building = command == 'build'
			
			if (building)
				input = input.map(x => x + '.html')
			
			return { build: { rollupOptions: { input } } }
		},
		configResolved: resolved => {
			config = resolved
		},
		resolveId(id) {
			console.log('R', id)
			return null
		},
		transform(content, id) {
			console.log('T', id)
			
			if (id.endsWith('.pug')) {
				let info = `[pvg] watching ${remove(config.root + '/', id)} for changes`
				content = { code: `console.debug("${info}")` }
			}
			
			return content
		},
		buildStart: async () => {
			if(!building || !input.length) return
			const realInput = input.map(x => x.replace('.html', ''))
			await file.rename(realInput, f => f + '.html')
		},
		buildEnd: async () => {
			if(!building || !input.length) return
			await file.rename(input, x => x.replace('.html', ''))
		},
		handleHotUpdate: async ({ file, server, read }) => {
			if (input.includes(file)) {
				const
					content = await read(),
					output = await transformer(content, {
						filename: file, server: true,
						path: file.replace(config.root, '')
					})

				server.ws.send({
					type: 'custom',
					event: 'pvg:update',
					data: { output }
				})

				return []
			}
			console.log('H', file)
		},
		transformIndexHtml: {
			order: 'pre',
			handler: transformer
		}
	}, bundler, middleware]
}

pvg.match = pattern => pvg({ match: pattern })

export default pvg
