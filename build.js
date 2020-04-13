const { writeFile } = require("fs").promises;
const { promise: clean } = require("delete");

const component = (pencil, props) => `import Pencil from "pencil.js";
import PComponent from "../p-component.vue";

export default {
    name: "P${pencil}",
    extends: PComponent,
    props: ${JSON.stringify(props)},
    beforeMount () {
        this.$pencil = new Pencil.${pencil}(this.position, ${props.reduce((str, p) => `${str}this.${p}, `, "")}this.options);
    },
};
`;

const exporter = list => `${list.map(([classe, file]) => `import P${classe} from "./${file}"`).join(";\n")}

export {
${list.map(([classe]) => `    P${classe}`).join(",\n")}
};
`;

const classes = {
    Heart: ["radius"],
    Line: ["points"],
    Spline: ["points", "tension"],
    Polygon: ["points"],
    RegularPolygon: ["nbSides", "radius"],
    Star: ["radius", "nbBranches", "bevelRatio"],
    Triangle: ["radius"],
    Rectangle: ["width", "height"],
    Image: ["url"],
    Square: ["size"],
    Arc: ["width", "height", "startAngle", "endAngle"],
    Ellipse: ["width", "height"],
    Circle: ["radius"],
    Text: ["text"],
    Button: [],
    Checkbox: [],
    // Knob: [], // FIXME: draggable is not working
    // Slider: [], // FIXME: same
    ProgressBar: [],
    ProgressPie: [],
    Select: ["items"],
};

const targetDir = "./src/components/generated";

(async () => {
    await clean(`${targetDir}/*.js`);

    const promises = Object.keys(classes).map(async (pencilClass) => {
        const code = component(pencilClass, classes[pencilClass]);
        const fileName = `p-${pencilClass.toLocaleLowerCase()}.js`;
        await writeFile(`${targetDir}/${fileName}`, code);
        return [pencilClass, fileName];
    });

    Promise.all(promises).then(async (files) => {
        const code = exporter(files);
        await writeFile(`${targetDir}/index.js`, code);

        console.log(`Successfully wrote ${files.length} files.`);
    });
})();
