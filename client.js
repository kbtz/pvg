if (import.meta.hot) {
	const { default: morphdom } = await import('morphdom')
  import.meta.hot.on('pvg:update', ({ output }) => {
		output = output.replace('<!DOCTYPE html>\n', '')
		morphdom(document.body.parentElement, output)
  })
}
