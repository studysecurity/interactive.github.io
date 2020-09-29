(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수
  let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; // 현재 활성화된(눈 앞에 보고있는) 씬(scroll-section)
  let enterNewScene = false; // 새로운 scene이 시작된 순간 true
  // video
  let acc = 0.2; // 감속 비율 (20%로 감속)
  let delayedYOffset = 0;
  let rafId; // 애니메이션 변수에 넣고 이 값으로 정지시킴. (requestAnimationFrame)
  let rafState; // 애니메이션 현재 상태 (requestAnimationFrame)

  const sceneInfo = [
    {
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-0'),
        messageA: document.querySelector('#scroll-section-0 .main-message.a'),
        messageB: document.querySelector('#scroll-section-0 .main-message.b'),
        messageC: document.querySelector('#scroll-section-0 .main-message.c'),
        messageD: document.querySelector('#scroll-section-0 .main-message.d'),
        canvas: document.querySelector('#video-canvas-0'),
        context: document.querySelector('#video-canvas-0').getContext('2d'),
        videoImages: []
      },
      values: {
        videoImageCount: 500,
        imageSequence: [0, 499],
        canvas_opacity: [1, 0, { start: 0.9, end: 1 }],
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
        messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
        messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
        messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
        messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
        messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
        messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
        messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
        messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
        messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
        messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
        messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
        messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }]
      }
    },
    {
      // 1
      type: 'normal',
      // heightNum: 5, // type normal에서는 필요 없음
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-1')
      }
    },
    {
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-2'),
        canvas: document.querySelector('#video-canvas-1'),
        context: document.querySelector('#video-canvas-1').getContext('2d'),
        videoImages: [],
        messageA: document.querySelector('#scroll-section-2 .a'),
        messageB: document.querySelector('#scroll-section-2 .b'),
        messageC: document.querySelector('#scroll-section-2 .c'),
        pinB: document.querySelector('#scroll-section-2 .b .pin'),
        pinC: document.querySelector('#scroll-section-2 .c .pin'),
      },
      values: {
        videoImageCount: 312,
        imageSequence: [0, 311],
        canvas_opacity_in: [0, 1, { start: 0, end: 0.1 }],
        canvas_opacity_out: [1, 0, { start: 0.95, end: 1 }],
        messageA_opacity_in: [0, 1, { start: 0.25, end: 0.3 }],
        messageA_opacity_out: [1, 0, { start: 0.4, end: 0.45 }],
        messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
        messageA_translateY_out: [0, -20, { start: 0.4, end: 0.45 }],
        messageB_opacity_in: [0, 1, { start: 0.6, end: 0.65 }],
        messageB_opacity_out: [1, 0, { start: 0.68, end: 0.73 }],
        messageB_translateY_in: [30, 0, { start: 0.6, end: 0.65 }],
        messageB_translateY_out: [0, -20, { start: 0.68, end: 0.73 }],
        messageC_opacity_in: [0, 1, { start: 0.87, end: 0.92 }],
        messageC_opacity_out: [1, 0, { start: 0.95, end: 1 }],
        messageC_translateY_in: [30, 0, { start: 0.87, end: 0.92 }],
        messageC_translateY_out: [0, -20, { start: 0.95, end: 1 }],
        pinB_scaleY: [0.5, 1, { start: 0.6, end: 0.65 }],
        pinC_scaleY: [0.5, 1, { start: 0.87, end: 0.92 }]
      }
    },
    {
      type: 'sticky',
      heightNum: 5,
      scrollHeight: 0,
      objs: {
        container: document.querySelector('#scroll-section-3'),
        canvasCaption: document.querySelector('.canvas-caption'),
        canvas: document.querySelector('.image-blend-canvas'),
        context: document.querySelector('.image-blend-canvas').getContext('2d'),
        imagesPath: [
          './images/blend-image-1.jpg',
          './images/blend-image-2.jpg'
        ],
        images: []
      },
      values: {
        rect1X: [0, 0, { start: 0, end: 0 }], // 왼쪽의 흰색 사각형 x좌표
        rect2X: [0, 0, { start: 0, end: 0 }], // 오른쪾의 흰색 사각형 x좌표
        blendHeight: [0, 0, { start: 0, end: 0 }],
        canvas_scale: [0, 0, { start: 0, end: 0 }],
        canvasCaption_opacity: [0, 1, { start: 0, end: 0 }],
        canvasCaption_translateY: [40, 0, { start: 0, end: 0 }],
        rectStartY: 0
      }
    },
    {
      type: 'sticky',
      heightNum: 5.2,
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-4"),
        pencilLogo: document.querySelector("#scroll-section-4 .pencil-logo"),
        pencil: document.querySelector("#scroll-section-4 .pencil"),
        ribbonPath: document.querySelector(".ribbon-path path"),
        messageA: document.querySelector("#scroll-section-4 .main-message.a"),
        messageB: document.querySelector("#scroll-section-4 .main-message.b"),
      },
      values: {
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messageB_opacity_in: [0, 1, { start: 0.4, end: 0.5 }],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageA_opacity_out: [1, 0, { start: 0.3, end: 0.4 }],
        messageB_opacity_out: [1, 0, { start: 0.6, end: 0.7 }],
        messageA_translateY_out: [0, -20, { start: 0.3, end: 0.4 }],
        pencilLogo_width_in: [1000, 200, { start: 0.1, end: 0.4 }],
        pencilLogo_width_out: [200, 50, { start: 0.4, end: 0.8 }],
        pencilLogo_translateX_in: [-10, -20, { start: 0.2, end: 0.4 }],
        pencilLogo_translateX_out: [-20, -50, { start: 0.4, end: 0.8 }],
        pencilLogo_opacity_out: [1, 0, { start: 0.8, end: 0.9 }],
        pencil_right: [-10, 70, { start: 0.3, end: 0.8 }],
        pencil_bottom: [-80, 100, { start: 0.3, end: 0.8 }],
        pencil_rotate: [-120, -200, { start: 0.3, end: 0.8 }],
        path_dashoffset_in: [1401, 0, { start: 0.2, end: 0.4 }],
        path_dashoffset_out: [0, -1401, { start: 0.6, end: 0.8 }],
      },
    }
  ];

  // 이미지 셋팅
  function setCanvasImages() {
    let imgElem;
    for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) {
      imgElem = new Image();
      imgElem.src = `./video/006/${(i + 1).toString().padStart(4, '0')}.jpg`;
      sceneInfo[0].objs.videoImages.push(imgElem);
    }

    let imgElem2;
    for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
      imgElem2 = new Image();
      imgElem2.src = `./video/007/${(i + 1).toString().padStart(4, '0')}.jpg`;
      sceneInfo[2].objs.videoImages.push(imgElem2);
    }

    let imgElem3;
    for (let i = 0; i < sceneInfo[3].objs.imagesPath.length; i++) {
      imgElem3 = new Image();
      imgElem3.src = sceneInfo[3].objs.imagesPath[i];
      sceneInfo[3].objs.images.push(imgElem3);
    }
  }

  // 헤더 메뉴 셋팅
  function checkMenu() {
    if (yOffset > 44) {
      document.body.classList.add('local-nav-sticky');
    } else {
      document.body.classList.remove('local-nav-sticky');
    }
  }

  function setLayout() {
    // 섹션별 높이 셋팅
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === 'sticky') {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
      } else if (sceneInfo[i].type === 'normal') {
        sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
      }
      sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
    }

    yOffset = window.pageYOffset; // 현재 스크롤 높이 셋팅

    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) { // ex) 2섹션 안에 스크롤 위치가 있으면 현재 씬은 2scene임.
        currentScene = i; // 현재 scene
        break;
      }
    }
    document.body.setAttribute('id', `show-scene-${currentScene}`);

    // 1920 x 1080 비율의 비디오 이미지가 깨지므로 비율 scale 조정
    const heightRatio = window.innerHeight / 1080;
    sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
    sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
  }

  function calcValues(values, currentYOffset) {
    let rv;

    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    if (values.length === 3) {
      // start ~ end 사이에 애니메이션 실행
      const partScrollStart = values[2].start * scrollHeight; // 현재 섹션 스크롤 높이에서 start 지점의 px 구하기
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart; // 애니메이션 스크롤 부분 (scrollStart ~ scrollEnd)사이

      // 섹션의 현재 스크롤 위치가 애니메이션 시작 시점 보다 크고 애니메이션 끝 시점보다 작으면
      if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
        rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
      } else if (currentYOffset < partScrollStart) {
        rv = values[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1];
      }
    } else {
      rv = scrollRatio * (values[1] - values[0]) + values[0];
    }

    return rv;
  }

  function playAnimation() {
    const objs = sceneInfo[currentScene].objs;
    const values = sceneInfo[currentScene].values;
    const currentYOffset = yOffset - prevScrollHeight; // 현재 섹션의 스크롤 높이 (ex) 섹션 2 안에서의 스크롤 한 만큼의 높이)
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    console.log(currentScene);
    switch (currentScene) {
      case 0:
        objs.canvas.style.opacity = calcValues(values.canvas_opacity, currentYOffset);

        if (scrollRatio < 0.22) {
          objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
          objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
        } else {
          objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
          objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.42) {
          objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
          objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
        } else {
          objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
          objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.62) {
          objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
          objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
        } else {
          objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
          objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.82) {
          objs.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
          objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
        } else {
          objs.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
          objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
        }

        break;

      case 2:
        if (scrollRatio <= 0.5) {
          objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
        } else {
          objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
        }

        if (scrollRatio <= 0.32) {
          // in
          objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
          objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
          objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.67) {
          objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
          objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
          objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
        } else {
          objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
          objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
          objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
        }

        if (scrollRatio <= 0.93) {
          objs.messageC.style.transform = `translate3d(-35px, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
          objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
          objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
        } else {
          objs.messageC.style.transform = `translate3d(-35px, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
          objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
          objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
        }

        // currentScene 3에서 쓰는 캔버스를 미리 그려주기 시작 (갑자기 툭 튀어나오는 것을 방지)
        if (scrollRatio > 0.9) {
          const objs = sceneInfo[3].objs;
          const values = sceneInfo[3].values;
          const widthRatio = window.innerWidth / objs.canvas.width;
          const heightRatio = window.innerHeight / objs.canvas.height;
          let canvasScaleRatio;

          if (widthRatio <= heightRatio) {
            // 캔버스 보다 브라우저 창이 홀쭉한 경우
            canvasScaleRatio = heightRatio;
          } else {
            // 캔버스 보다 브라우저 창이 납작한 경우
            canvasScaleRatio = widthRatio;
          }

          objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
          objs.context.fillStyle = 'white';
          objs.context.drawImage(objs.images[0], 0, 0);

          const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio; // offsetWidth는 스크롤간격을 제외한 넓이
          // const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

          // 좌우 흰색 박스 좌표 잡아주기
          const whiteRectWidth = recalculatedInnerWidth * 0.15;
          values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
          values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
          values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
          values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

          // 좌우 흰색 박스 그리기
          objs.context.fillRect(
            parseInt(values.rect1X[0]),
            0,
            parseInt(whiteRectWidth),
            objs.canvas.height
          );
          objs.context.fillRect(
            parseInt(values.rect2X[0]),
            0,
            parseInt(whiteRectWidth),
            objs.canvas.height
          );
        }

        break;

      case 3:
        let step = 0;

        const widthRatio = window.innerWidth / objs.canvas.width;
        const heightRatio = window.innerHeight / objs.canvas.height;
        let canvasScaleRatio;

        if (widthRatio <= heightRatio) {
          canvasScaleRatio = heightRatio;
        } else {
          canvasScaleRatio = widthRatio;
        }

        objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
        objs.context.fillStyle = 'white';
        objs.context.drawImage(objs.images[0], 0, 0);

        // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
        const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
        // const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

        if (!values.rectStartY) {
          // scaleㄹ 인해 줄어든 canvas의 높이
          values.rectStartY = objs.canvas.offsetTop + (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
          values.rect1X[2].start = (window.innerHeight / 2) / scrollHeight;
          values.rect2X[2].start = (window.innerHeight / 2) / scrollHeight;
          values.rect1X[2].end = values.rectStartY / scrollHeight;
          values.rect2X[2].end = values.rectStartY / scrollHeight;
        }

        const whiteRectWidth = recalculatedInnerWidth * 0.15;
        values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
        values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
        values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
        values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

        // 좌우 흰색 박스 그리기
        objs.context.fillRect(
          parseInt(calcValues(values.rect1X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          objs.canvas.height
        );
        objs.context.fillRect(
          parseInt(calcValues(values.rect2X, currentYOffset)),
          0,
          parseInt(whiteRectWidth),
          objs.canvas.height
        );

        if (scrollRatio < values.rect1X[2].end) {
          step = 1;
          objs.canvas.classList.remove('sticky');
        } else {
          step = 2;

          objs.canvas.classList.add('sticky');
          // sticky 붙이면 패딩때문에 원래 위치로 오는데 다시 top -로 위치해서 맨위에 올라오게
          objs.canvas.style.top = `${-(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`;

          // 블렌딩 2번쨰 이미지
          values.blendHeight[0] = 0;
          values.blendHeight[1] = objs.canvas.height;
          values.blendHeight[2].start = values.rect1X[2].end;
          values.blendHeight[2].end = values.blendHeight[2].start + 0.2; // 20% 비율로 짤라서 이미지 보여주기
          const blendHeight = calcValues(values.blendHeight, currentYOffset);

          objs.context.drawImage(objs.images[1],
            0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight,
            0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight
          );

          // 2번쨰 이미지가 나오고 나서 이미지 크기 축소
          if (scrollRatio > values.blendHeight[2].end) {
            values.canvas_scale[0] = canvasScaleRatio;
            values.canvas_scale[1] = document.body.offsetWidth / (1.5 * objs.canvas.width);
            values.canvas_scale[2].start = values.blendHeight[2].end;
            values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

            objs.canvas.style.transform = `scale(${calcValues(values.canvas_scale, currentYOffset)})`;
            objs.canvas.style.marginTop = 0; // 스크롤 올릴 떄 (xx)
          }

          if (scrollRatio > values.canvas_scale[2].end && values.canvas_scale[2].end > 0) { // scale[2].end 2번째 이미지가 끝나고난 후의 값이 셋팅되므로 그 이후에 스크롤
            objs.canvas.classList.remove('sticky');
            objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`; // 스크롤 내릴 때 (xx)

            values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
            values.canvasCaption_opacity[2].end = values.canvasCaption_opacity[2].start + 0.1;
            values.canvasCaption_translateY[2].start = values.canvasCaption_opacity[2].start;
            values.canvasCaption_translateY[2].end = values.canvasCaption_opacity[2].end;
            objs.canvasCaption.style.opacity = calcValues(values.canvasCaption_opacity, currentYOffset);
            objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(values.canvasCaption_translateY, currentYOffset)}%, 0)`;
          }
        }
        break;

      case 4:
        if (scrollRatio <= 0.25) {
          // in
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          // out
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0)`;
        }

        if (scrollRatio <= 0.55) {
          // in
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_in,
            currentYOffset
          );
        } else {
          // out
          objs.messageB.style.opacity = calcValues(
            values.messageB_opacity_out,
            currentYOffset
          );
        }

        // 크기가 커져도 깨지지 않는 SVG의 장점을 살리기 위해 transform scale 대신 width를 조정
        if (scrollRatio <= 0.4) {
          objs.pencilLogo.style.width = `${calcValues(
            values.pencilLogo_width_in,
            currentYOffset
          )}vw`;
          objs.pencilLogo.style.transform = `translate(${calcValues(
            values.pencilLogo_translateX_in,
            currentYOffset
          )}%, -50%)`;
        } else {
          objs.pencilLogo.style.width = `${calcValues(
            values.pencilLogo_width_out,
            currentYOffset
          )}vw`;
          objs.pencilLogo.style.transform = `translate(${calcValues(
            values.pencilLogo_translateX_out,
            currentYOffset
          )}%, -50%)`;
        }

        // 빨간 리본 패스(줄 긋기)
        if (scrollRatio <= 0.5) {
          objs.ribbonPath.style.strokeDashoffset = calcValues(
            values.path_dashoffset_in,
            currentYOffset
          );
        } else {
          objs.ribbonPath.style.strokeDashoffset = calcValues(
            values.path_dashoffset_out,
            currentYOffset
          );
        }

        objs.pencilLogo.style.opacity = calcValues(
          values.pencilLogo_opacity_out,
          currentYOffset
        );
        objs.pencil.style.right = `${calcValues(
          values.pencil_right,
          currentYOffset
        )}%`;
        objs.pencil.style.bottom = `${calcValues(
          values.pencil_bottom,
          currentYOffset
        )}%`;
        objs.pencil.style.transform = `rotate(${calcValues(
          values.pencil_rotate,
          currentYOffset
        )}deg)`;


        break;
    }
  }

  function scrollLoop() {
    enterNewScene = false;
    prevScrollHeight = 0;

    for (let i = 0; i < currentScene; i++) {
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }

    if (delayedYOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      document.body.classList.remove('scroll-effect-end');
    }

    if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      enterNewScene = true;
      if (currentScene === sceneInfo.length - 1) {
        document.body.classList.add('scroll-effect-end');
      }
      if (currentScene < sceneInfo.length - 1) {
        currentScene++;
      }
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (delayedYOffset < prevScrollHeight) {
      enterNewScene = true;
      if (currentScene === 0) return;
      currentScene--;
      document.body.setAttribute('id', `show-scene-${currentScene}`);
    }

    if (enterNewScene) return;

    playAnimation();
  }

  function loop() {
    delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc; // 애니메이션 감속(매끄럽게)

    if (!enterNewScene) {
      if (currentScene === 0 || currentScene === 2) {
        const currentYOffset = delayedYOffset - prevScrollHeight;
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;
        let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
        if (objs.videoImages[sequence]) {
          objs.context.drawImage(objs.videoImages[sequence], 0, 0);
        }
      }
    }

    // 일부 기기에서 페이지 끝으로 고속 이동하면 body id가 제대로 인식 안되는 경우를 해결
    // 페이지 맨 위로 갈 경우: scrollLoop와 첫 scene의 기본 캔버스 그리기 수행
    if (delayedYOffset < 1) {
      scrollLoop();
      sceneInfo[0].objs.canvas.style.opacity = 1;
      sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);
    }
    // 페이지 맨 아래로 갈 경우: 마지막 섹션은 스크롤 계산으로 위치 및 크기를 결정해야할 요소들이 많아서 1픽셀을 움직여주는 것으로 해결
    if ((document.body.offsetHeight - window.innerHeight) - delayedYOffset < 1) {
      let tempYOffset = yOffset;
      scrollTo(0, tempYOffset - 1);
    }

    rafId = requestAnimationFrame(loop); // 비디오 이미지 반복 애니메이션 처리

    if (Math.abs(yOffset - delayedYOffset) < 1) { // 비디오 이미지 섹션을 벗어날 경우 애니메이션 종료
      cancelAnimationFrame(rafId);
      rafState = false;
    }
  }

  window.addEventListener('load', () => {
    setLayout(); // 중간에 새로고침 시, 콘텐츠 양에 따라 높이 계산에 오차가 발생하는 경우를 방지하기 위해 before-load 클래스 제거 전에도 확실하게 높이를 세팅하도록 한번 더 실행
    document.body.classList.remove('before-load');
    setLayout(); // 레이아웃 셋팅
    sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0); // 비디오 첫 이미지 셋팅

    // 중간에서 새로고침 했을 경우 자동 스크롤로 제대로 그려주기
    let tempYOffset = yOffset;
    let tempScrollCount = 0;
    if (tempYOffset > 0) {
      let siId = setInterval(() => {
        scrollTo(0, tempYOffset);
        tempYOffset += 5;

        if (tempScrollCount > 10) {
          clearInterval(siId);
        }
        tempScrollCount++;
      }, 20);
    }

    window.addEventListener('scroll', () => {
      yOffset = window.pageYOffset;
      scrollLoop();
      checkMenu();

      if (!rafState) {
        // 비디오 애니메이션 정치 여부를 정하기 위해 변수에 저장
        rafId = requestAnimationFrame(loop);
        rafState = true;
      }
    })

    // 브라우저 크기 조절
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        window.location.reload();
      }
    });

    // 모바일 가로 세로 화면 전환시
    window.addEventListener('orientationchange', () => {
      scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });

    // .loading의 애니메이션이 끝나면 제거
    document.querySelector('.loading').addEventListener('transitionend', (e) => {
      document.body.removeChild(e.currentTarget);
    });
  });

  // 비디오 이미지 셋팅
  setCanvasImages();
})(); 