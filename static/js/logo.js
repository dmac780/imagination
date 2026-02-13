/**
 * Pyramid logo animation
 * @author: dmac780 <https://github.com/dmac780>
 */

const canvas = document.getElementById('pyramidCanvas');

if (!canvas) {
    console.log('Pyramid logo canvas not found');
} else {
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.logo-container');

    let isHovering = false;
    let rotationX  = 0;
    let rotationY  = 0;
    let lastFrameTime = performance.now();
    
    // Target 60fps
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms
    
    // Rotation speeds in radians per second (not per frame)
    const ROTATION_SPEED_X = 1.2; // radians/second (was 0.02 per frame at 60fps = 1.2 rad/s)
    const ROTATION_SPEED_Y = 1.8; // radians/second (was 0.03 per frame at 60fps = 1.8 rad/s)
    const EASE_SPEED = 0.0006;    // easing factor per second (was 0.00001 per frame at 60fps)

    const vertices = [
        [0, 12, 0],       // 0: apex
        [-10, -8, -10],   // 1: base front-left
        [10, -8, -10],    // 2: base front-right
        [10, -8, 10],     // 3: base back-right
        [-10, -8, 10]     // 4: base back-left
    ];

    const edges = [
        [0, 1], [0, 2], [0, 3], [0, 4], // apex to base corners
        [1, 2], [2, 3], [3, 4], [4, 1]  // base edges
    ];

    function getTextColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    }

    function rotateX(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return [
            point[0],
            point[1] * cos - point[2] * sin,
            point[1] * sin + point[2] * cos
        ];
    }

    function rotateY(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return [
            point[0] * cos + point[2] * sin,
            point[1],
            -point[0] * sin + point[2] * cos
        ];
    }

    // Simple orthographic projection
    function project(point) {
        const scale = 1.5;

        return [
            25 + point[0] * scale,
            25 + point[1] * scale
        ];
    }

    function draw() {
        ctx.clearRect(0, 0, 50, 50);
        
        let transformedVertices = vertices.map(v => {
            let point = [...v];

            if (isHovering) {
                point = rotateX(point, rotationX);
                point = rotateY(point, rotationY);
            }

            return project(point);
        });
        
        ctx.strokeStyle = getTextColor();
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        
        edges.forEach(edge => {
            const [start, end] = edge;
            ctx.beginPath();
            ctx.moveTo(transformedVertices[start][0], transformedVertices[start][1]);
            ctx.lineTo(transformedVertices[end][0], transformedVertices[end][1]);
            ctx.stroke();
        });
    }

    function animate(timestamp) {
        if (!timestamp) timestamp = performance.now();
        
        const deltaTime = timestamp - lastFrameTime;
        
        // Throttle to 60fps - only update if enough time has passed
        if (deltaTime < FRAME_TIME) {
            requestAnimationFrame(animate);
            return;
        }
        
        // Update lastFrameTime, accounting for any overflow
        lastFrameTime = timestamp - (deltaTime % FRAME_TIME);
        
        // Convert deltaTime to seconds for frame-rate independent movement
        const deltaSeconds = deltaTime / 1000;
        
        if (isHovering) {
            rotationX += ROTATION_SPEED_X * deltaSeconds;
            rotationY += ROTATION_SPEED_Y * deltaSeconds;
        } else {
            rotationX += (0 - rotationX) * EASE_SPEED * deltaSeconds;
            rotationY += (0 - rotationY) * EASE_SPEED * deltaSeconds;
            
            // Stop when very close to prevent micro-movements
            if (Math.abs(rotationX) < 0.0001) rotationX = 0;
            if (Math.abs(rotationY) < 0.0001) rotationY = 0;
        }
        
        draw();

        requestAnimationFrame(animate);
    }

    container.addEventListener('mouseenter', () => {
        isHovering = true;
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
    });

    animate();
}