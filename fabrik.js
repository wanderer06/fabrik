const stage = document.getElementById('stage');
const ctx = stage.getContext('2d');

const width = 1280;
const height = 800;

stage.width = width;
stage.height = height;

stage.addEventListener('mousemove', event => {
    const rect = stage.getBoundingClientRect();
    target.x = event.clientX - rect.left;
    target.y = event.clientY - rect.top;
})

stage.addEventListener('click', event => {
    const rect = stage.getBoundingClientRect();
    points.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    })
})

document.addEventListener('keyup', event => {
    if (event.code === 'NumpadAdd') frame();
    if (event.code === 'KeyR') {
        points = [];
        points_initialized = false;
    }
    if (event.code == 'Enter') {
        points_initialized = true;
    }
})

let points = []
let distances = []
let points_initialized = false;
const target = {x: 0, y: 0}

function clear()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
}

function draw_line(x1, y1, x2, y2)
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function draw_circle(x, y, radius, colour)
{
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function substract(from, amount)
{
    return {
        x: from.x - amount.x,
        y: from.y - amount.y
    };
}

function add(vec1, val)
{
    return {
        x: vec1.x + (val.hasOwnProperty('x') ? val.x : val),
        y: vec1.y + (val.hasOwnProperty('y') ? val.y : val)
    };
}

function multiply(vec1, val)
{
    return {
        x: vec1.x * (val.hasOwnProperty('x') ? val.x : val),
        y: vec1.y * (val.hasOwnProperty('y') ? val.y : val)
    };
}

function magnitude(vec)
{
    return Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));
}

function draw()
{
    for (let i = 0; i < points.length; i++) {
        const point = points[i];

        if (i < points.length - 1) {
            draw_line(point.x, point.y, points[i + 1].x, points[i + 1].y);
        }

        draw_circle(point.x, point.y, 3, 'red');
    }
}

function distance(from, amount)
{
    return magnitude(substract(from, amount));
}

// http://www.andreasaristidou.com/publications/papers/FABRIK.pdf
function calculate_fabrik_positions()
{
    if (points.length === 0 || !points_initialized) {
        return;
    }

    // calculate distances
    distances = [];
    for (let i = 0; i < points.length - 1; i++) {
        distances.push(distance(points[i + 1], points[i]));
    }

    // check distance between root and target
    const root_distance = distance(target, points[0]);

    // check if target is in reach
    let total_distance = distances.reduce((acc, curr) => acc + curr, 0);

    if (root_distance > total_distance) {
        for (let i = 0; i < points.length - 1; i++) {
            let r = distance(target, points[i]);
            let delta = distances[i] / r;

            points[i + 1] = add(
                multiply(points[i], (1 - delta)),
                multiply(target, delta)
            );
        }
    } else {
        let b = {...points[0]};
        let diff = distance(points[points.length - 1], target);

        let iterations = 0;
        while (iterations++ < 10) {
            points[points.length - 1] = {...target};

            for (let i = points.length - 2; i >= 0; i--) {
                let r = distance(points[i + 1], points[i])
                let delta = distances[i] / r;

                points[i] = add(
                    multiply(points[i + 1], (1 - delta)),
                    multiply(points[i], delta)
                )
            }

            points[0] = {...b};

            for (let i = 0; i < points.length - 1; i++) {
                let r = distance(points[i + 1], points[i]);
                let delta = distances[i] / r;

                points[i + 1] = add(
                    multiply(points[i], (1 - delta)),
                    multiply(points[i + 1], delta)
                )
            }

            diff = distance(points[points.length - 1], target);
        }
    }
}

function frame() {
    clear();
    calculate_fabrik_positions();
    draw();
    requestAnimationFrame(frame);
}

frame();