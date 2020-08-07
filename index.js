const input = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const boxBlurKernel = size => {
    const kernel = [];
    for (let x = -size; x <= size; x++)
        for (let y = -size; y <= size; y++)
            kernel.push({ x, y, value: 1 });
    return kernel;
};

const edgeDetectionKernel = size => {
    const kernel = [];
    for (let x = -size; x <= size; x++)
        for (let y = -size; y <= size; y++)
            kernel.push({ x, y, value: x === 0 && y === 0 ? Math.pow(size * 2 + 1, 2) - 1 : -1 });
    return kernel;
};

const edgeDetectionKernel2 = size => {
    const kernel = [];
    for (let x = -size; x <= size; x++)
        for (let y = -size; y <= size; y++)
            kernel.push({ x, y, value: x === 0 && y === 0 ? size * 4 : x === 0 || y === 0 ? -1 : 0 });
    return kernel;
};

const sharpenKernel = size => {
    const kernel = [];
    for (let x = -size; x <= size; x++)
        for (let y = -size; y <= size; y++)
            kernel.push({ x, y, value: x === 0 && y === 0 ? size * 4 + 1 : x === 0 || y === 0 ? -1 : 0 });
    return kernel;
};

let imageData, offset = 1;
const image = new Image();
image.onload = () => {
    canvas.width = image.width * 6;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    imageData = ctx.getImageData(0, 0, image.width, image.height);

    // applyKernel(sharpenKernel(1));
    applyKernel(boxBlurKernel(2));
    applyKernel(edgeDetectionKernel(2), true);
};

const reader = new FileReader();
reader.onload = e => image.src = e.target.result;

input.addEventListener("change", () => reader.readAsDataURL(input.files[0]));

const itxy = i => ({ x: i % image.width, y: Math.floor(i / image.width) });
const xyti = (x, y) => y * image.width + x;

const applyKernel = (kernel, grayScale = false, threshold = 0) => {
    const data = imageData.data.slice();
    for (let i = 0; i < data.length; i += 4) {
        const xy = itxy(i / 4);
        let r = 0, g = 0, b = 0, w = 0;
        for (let k = 0; k < kernel.length; k++) {
            const ix = xy.x + kernel[k].x;
            const iy = xy.y + kernel[k].y;
            if (ix >= 0 && ix < image.width && iy >= 0 && iy < image.height) {
                const j = xyti(ix, iy) * 4;
                w += kernel[k].value;
                if (grayScale) {
                    const value = ((data[j] + data[j + 1] + data[j + 2]) / 3) * kernel[k].value;
                    r += value;
                } else {
                    r += data[j] * kernel[k].value;
                    g += data[j + 1] * kernel[k].value;
                    b += data[j + 2] * kernel[k].value;
                }
            }
        }
        if (w == 0) w = 1;
        if (grayScale) {
            let value = r / w;
            if (threshold > 0) value = value < threshold ? 0 : 255;
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
        } else {
            imageData.data[i] = r / w;
            imageData.data[i + 1] = g / w;
            imageData.data[i + 2] = b / w;
        }
    }
    ctx.putImageData(imageData, image.width * offset++, 0);
};
