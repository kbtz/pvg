import pug from 'pug'


/**
 * @type {import('vite').IndexHtmlTransform}
 */
export default {
	order: 'pre',
	handler: async (content, { path, filename, server }) => {
		console.log('I', path)
		
		if (!/\.pug(\.html)?$/.test(path))
			return content
		
		const
			basedir = filename.replace(path, ''),
			building = !server,
			options = {
				basedir, filename,
				pretty: true,
				doctype: 'html',
				compileDebug: false,
				inlineRuntimeFunctions: false
			}
		
		console.time()
		
		let output = pug.render(content, options)
		
		if (!building) {
			let { dependencies } = pug.compileClientWithDependenciesTracked(content, options)
			if (dependencies.length) {
				dependencies = dependencies.map(d => `import '${d}';`).join(' ')
				output = output.replace('</body>', `
					<script type="module">${dependencies}</script>
				</body>`)
			}
		}

		console.timeEnd()

		return output
	}
}
