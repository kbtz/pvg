import { file, path } from './utils.js'

/**
 * Manually trigger a index transform for any dev server request
 * that would land on the build result of a pug file entry point
 * @type {import('vite').Plugin}
 */
export default {
	name: 'pvg:middleware',
	apply: 'serve',
	configureServer: ({ config, middlewares, transformIndexHtml }) => 
		() => // wrapped so it becomes a post middleware
		middlewares.use(async (req, res, next) => {
			let 
				entry = config.root + path.fromUrl(req.originalUrl),
				entries = config.build.rollupOptions.input
			
			if (path.isDir(entry) && !entry.endsWith('/')) {
				// enforce trailing slash for consistent relative paths
				res.writeHead(301, { Location: req.originalUrl + '/' })
				res.end()
				return
			}

			if (path.isDir(entry))
				entry = path(entry, 'index.html')

			entry = entry.replace(/\.html$/, '.pug')

			if (
				file.exists(entry) 
				&& entry.endsWith('.pug') 
				&& entries.includes(entry)
			) {
				let 
					input = file.read(entry),
					template = entry.replace(config.root, ''),
					output = await transformIndexHtml(template, input)

				res.setHeader('Content-Type', 'text/html')
				res.statusCode = 200
				res.end(output)
			} else {
				next()
			}
		})
}
