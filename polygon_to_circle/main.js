const numPolygons = 4;
const minPolygon = 5;
const maxPolygon = 10;
const numCirclePoints = 24;
const size = 100;
const margin = 5;

let polygonsPoints = [];
let centers = [];
let rs = [];

for (let i = 0; i < numPolygons; i++) {
    const n = getRandomInt(minPolygon, maxPolygon);
    let polygonPoints = getPolygonPoints(size, margin, n, i);
    polygonPoints = getComplementedPoints(polygonPoints, numCirclePoints);

    polygonsPoints.push(polygonPoints);
    centers.push([
        i * (size + 2 * margin) + 0.5 * (size + margin),
        0.5 * (size + margin)
    ]);
    rs.push(getRandomInt(parseInt(size / 20), parseInt(size / 2)));
}

// draw
const svg = document.getElementById("screen");
initSvg(svg, size, margin, numPolygons);
drawPolygons(svg, polygonsPoints, centers, rs);

function initSvg(svg, size, margin, numPolygons) {
    const width = (size + 2 * margin) * numPolygons;
    const height = size + 2 * margin;
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
}

function drawPolygons(svg, polygonsPoints, centers, rs) {
    const ns = "http://www.w3.org/2000/svg";
    polygonsPoints.forEach(function (points, index) {
        const centerPoint = centers[index];
        const r = rs[index];

        const polygon = document.createElementNS(ns, "polygon");
        polygon.setAttribute('fill', "#ffffff");
        polygon.setAttribute('stroke', 'blue');
        polygon.setAttribute('stroke-width', 2);
        polygon.setAttribute('points', getPointsString(points));

        // create move animation
        const animatePolygon = document.createElementNS(ns, 'animate');
        const movedPoints = _getMovedPoints(points, centerPoint, r);
        animatePolygon.setAttribute('begin', "screen.click + " + index + 's');
        animatePolygon.setAttribute('attributeName', 'points');
        animatePolygon.setAttribute('dur', '3s');
        animatePolygon.setAttribute('to', getPointsString(movedPoints));
        animatePolygon.setAttribute('fill', 'freeze');
        polygon.appendChild(animatePolygon);

        // create color animation
        const animateColor = document.createElementNS(ns, 'animate');
        animateColor.setAttribute('begin', "screen.click + " + index + 's');
        animateColor.setAttribute('attributeName', 'fill');
        animateColor.setAttribute('dur', '3s');
        animateColor.setAttribute('to', '#00ffff');
        animateColor.setAttribute('fill', 'freeze');
        polygon.appendChild(animateColor);

        svg.appendChild(polygon);
    });
}

function getPointsString(points) {
    let buf = "";
    points.forEach(function (p, index) {
        if (index != 0) {
            buf += " ";
        }
        buf += (p[0] + "," + p[1]);
    });
    return buf;
}

function getPolygonPoints(size, margin, n, index) {
    let ret = [];
    let randomPoints = _getRandomPoints(size, margin, n, index);

    let pointIndex = _getMinYPointIndex(randomPoints);
    let basePoint = randomPoints[pointIndex];
    ret.push(basePoint);

    _getSortedIndexes(randomPoints, basePoint).forEach(function (i) {
        ret.push(randomPoints[i]);
    });
    return ret;
}

function getComplementedPoints(points, n) {
    let numAdd = n - points.length;
    if (numAdd <= 0) {
        return points;
    }
    let ret = [];
    for (let i = 0; i < numAdd; i++) {
        ret.push(points[0]);
    }
    return ret.concat(points);
}

function _getSortedIndexes(points, basePoint) {
    let angleDistanceIndexes = [];
    points.forEach(function (point, index) {
        let ret = _getAngleDistance(point, basePoint);
        angleDistanceIndexes.push([ret.angle, ret.distance, index]);
    });

    angleDistanceIndexes.sort();
    let ret = [];
    angleDistanceIndexes.forEach(function (v, i) {
        if (i != 0) {
            ret.push(v[2]);
        }
    });
    return ret;
}

function _getAngleDistance(point, basePoint) {
    const dx = point[0] - basePoint[0];
    const dy = point[1] - basePoint[1];

    const angle = Math.atan2(dy, dx);
    let distance = dx * dx + dy * dy;
    if (angle) {
        distance *= (-1);
    }
    return {
        angle: angle,
        distance: distance
    };
}

function _getRandomPoints(size, margin, n, index) {
    let points = [];
    for (let i = 0; i < n; i++) {
        const x = getRandomInt(1, size + 1);
        const y = getRandomInt(1, size + 1);
        const offset = (2 * margin + size) * index + margin;
        points.push([x + offset, y + margin]);
    }
    return points;
}

function _getMinYPointIndex(points) {
    let minY = Number.MAX_VALUE;
    let minIndex = 0;
    points.forEach(function (point, i) {
        if (point[1] < minY) {
            minY = point[1];
            minIndex = i;
        }
    });
    return minIndex;
}

function _getMovedPoints(points, centerPoint, r) {
    let ret = [];
    let n = points.length;
    const step = 2 * Math.PI / n;
    for (let i = 0; i < n; i++) {
        let theta = step * i + Math.PI / 4;
        const x = r * Math.cos(theta) + centerPoint[0];
        const y = r * Math.sin(theta) + centerPoint[1];
        ret.push([x, y]);
    }
    return ret;
}
function getRandomInt(minValue, maxValue) {
    const a = maxValue - minValue;
    return Math.floor(Math.random() * a + minValue);
}
