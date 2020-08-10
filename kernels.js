
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

const gaussianKernel = (size, a = 1) => {
    const kernel = [];
    console.log(a);
    for (let x = -size; x <= size; x++)
        for (let y = -size; y <= size; y++) {
            const i = x + size + 1;
            const j = y + size + 1;
            const value = (1 / (2 * Math.PI * a * a)) * Math.exp(-(Math.pow(i - (size + 1), 2) + Math.pow(j - (size + 1), 2)) / (2 * a * a));
            kernel.push({ x, y, value });
        }
    return kernel;
};
