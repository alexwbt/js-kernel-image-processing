const input = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const reader = new FileReader();
reader.onload = e => image.src = e.target.result;
input.addEventListener("change", () => reader.readAsDataURL(input.files[0]));

let imageData, offset = 0;
const image = new Image();
image.onload = () => {
    canvas.width = image.width * 6;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    offset = 0;

    applyKernel(gaussianKernel(2));
    applyKernel(edgeDetectionKernel(2), true);
    hysteresisThreshold(60, 125);
};


const indexToXY = i => ({ x: i % image.width, y: Math.floor(i / image.width) });
const XYToIndex = (x, y) => y * image.width + x;
const applyKernel = (kernel, grayScale = false, fromOffset = offset) => {
    imageData = ctx.getImageData(image.width * fromOffset, 0, image.width, image.height);
    const data = imageData.data.slice();
    for (let i = 0; i < data.length; i += 4) {
        const xy = indexToXY(i / 4);
        let r = 0, g = 0, b = 0, w = 0;
        for (let k = 0; k < kernel.length; k++) {
            const ix = xy.x + kernel[k].x;
            const iy = xy.y + kernel[k].y;
            if (ix >= 0 && ix < image.width && iy >= 0 && iy < image.height) {
                const j = XYToIndex(ix, iy) * 4;
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
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
        } else {
            imageData.data[i] = r / w;
            imageData.data[i + 1] = g / w;
            imageData.data[i + 2] = b / w;
        }
    }
    ctx.putImageData(imageData, image.width * ++offset, 0);
};

const connected = (data, i, strong, d) => {
    const xy = indexToXY(i / 4);
    for (let x = -d; x <= d; x++) {
        for (let y = -d; y <= d; y++) {
            const j = XYToIndex(xy.x + x, xy.y + y) * 4;
            if (j >= 0 && j < data.length && data[j] >= strong)
                return true;
        }
    }
    return false;
};
const hysteresisThreshold = (weak, strong = 255, d = 1, fromOffset = offset) => {
    imageData = ctx.getImageData(image.width * fromOffset, 0, image.width, image.height);
    const data = imageData.data.slice();
    for (let i = 0; i < data.length; i += 4) {
        const value = data[i] >= strong || (data[i] >= weak && connected(data, i / 4, strong, d)) ? 255 : 0;
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
    }
    ctx.putImageData(imageData, image.width * ++offset, 0);
};
