const fs = require('mz/fs');
const path = require('path');

const dot = require('dot');
const less = require('less');
const Inferno = require('inferno');
const InfernoServer = require('inferno-server');

const DayView = require('./component/DayView');

const TEMPLATE_FILE = path.join(__dirname, 'component', 'index.html');
const STYLES_FILE = path.join(__dirname, 'styles.less');

async function render(events) {
    const template = (await fs.readFile(TEMPLATE_FILE)).toString();
    const styles = (await fs.readFile(STYLES_FILE)).toString();
    const tpl = dot.compile(template);

    const body = InfernoServer.renderToString(<DayView events={events}/>);
    const css = (await less.render(styles)).css;

    return {
        html: tpl({ body }),
        css
    };
}

module.exports = render;
