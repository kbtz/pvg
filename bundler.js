/** @type {import('vite').UserConfig} */
let config

/**
 * @type {import('vite').Plugin}
 */
export default {
	name: 'pvg:bundle',
	enforce: 'post',
	configResolved: resolved => config = resolved,
	generateBundle: async (options, bundle) => {
		const { input = [] } = config.build.rollupOptions
		for (let entry of input) {
			if (!entry.endsWith('.pug.html')) continue
			
			entry = entry.replace(config.root + '/', '')
			
			if (bundle[entry])
				bundle[entry].fileName = entry.replace(/\.pug\.html$/, '.html')
			else
				console.warn(`Entry ${entry} not found in the resulting bundle`)
		}
	}
}
