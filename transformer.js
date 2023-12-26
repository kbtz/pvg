import pug from 'pug'
import { pugLoader } from './data-loader.js'

/**
 * @type {import('vite').IndexHtmlTransformHook}
 */
export default async (content, { path, filename, server }) => {
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

	let data = pugLoader(content, filename)
	if (data) Object.assign(options, data)

	content = content.replace(/^\+load\(.*\)\s*$/gm, '')

	let output = pug.render(content, options)

	if (!building) {
		let { dependencies } = pug.compileClientWithDependenciesTracked(content, options)
		if (dependencies.length) {
			dependencies = dependencies.map(d => `import "${d}";`).join(' ')
			output = output.replace('</body>', `
				<script type="module">${dependencies}</script>
			</body>`)
		}

		output = output.replace('</body>',
			'<script type="module">import "pvg/client.js"</script></body>')
	}

	return output
}
