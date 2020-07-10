import ElementQueries from 'css-element-queries/src/ElementQueries';



window.addEventListener('load', () => {
    // медиа выражения на основе ширины элементов, а не окна
    ElementQueries.init();
})


$(document).ready(function () {


    setTimeout(() => {
        document.querySelector(".preloader").remove()
    }, 1500);


    const knob = document.querySelector(".audio-bar__knob"),
        leftBar = document.querySelector(".audio-bar__left"),
        container = knob.parentElement;


    let x = 0,
        y = 0,
        leftWidth = 0;

    console.log(container)




    const mouseDonwnHandler = (e) => {
        x = e.clientX;

        leftWidth = leftBar.getBoundingClientRect().width;
        const dx = x - leftBar.getBoundingClientRect().right;

        const containerWidth = container.getBoundingClientRect().width;
        leftWidth = (leftWidth + dx) * 100 / containerWidth;
        leftWidth = Math.max(leftWidth, 0);
        leftWidth = Math.min(leftWidth, 100);

        leftBar.style.width = `${leftWidth}%`;

        console.log(leftWidth)
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }

    const mouseMoveHandler = (e) => {
        const dx = e.clientX - leftBar.getBoundingClientRect().right;
        const containerWidth = container.getBoundingClientRect().width;
        leftWidth = leftBar.getBoundingClientRect().width;
        leftWidth = (leftWidth + dx) * 100 / containerWidth;
        leftWidth = Math.max(leftWidth, 0);
        leftWidth = Math.min(leftWidth, 100);
        leftBar.style.width = `${leftWidth}%`;
        // console.log(leftWidth)
    }

    const mouseUpHandler =  () => {
        // leftSide.style.removeProperty('user-select');
        // leftSide.style.removeProperty('pointer-events');

        // rightSide.style.removeProperty('user-select');
        // rightSide.style.removeProperty('pointer-events');

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };


    container.addEventListener('mousedown', mouseDonwnHandler)
})