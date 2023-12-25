import morphdom from 'morphdom'

if (import.meta.hot) {
  import.meta.hot.on('pvg:update', ({ output }) => {
		output = output.replace('<!DOCTYPE html>\n', '')
		morphdom(document.body.parentElement, output)
  })
}
