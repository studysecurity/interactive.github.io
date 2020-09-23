(() => {
  let yOffset = 0; // window.pageYOffset 대신 쓸 변수
  let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; // 현재 활성화된(눈 앞에 보고있는) 씬(scroll-section)
  let enterNewScene = false; // 새로운 scene이 시작된 순간 true

  const sceneInfo = [
    {
      type: "sticky",
      heightNum: 3,
      scrollHeight: 0,
      objs: {
        container: document.querySelector("#scroll-section-0"),
        pencilLogo: document.querySelector("#scroll-section-0 .pencil-logo"),
        messageA: document.querySelector("#scroll-section-0 .main-message.a"),
        ribbonPath: document.querySelector(".ribbon-path path"),
        messageB: document.querySelector("#scroll-section-0 .main-message.b"),
        pencil: document.querySelector("#scroll-section-0 .pencil"),
      },
      values: {
        pencilLogo_width_in: [1000, 200, { start: 0.1, end: 0.4 }],
        pencilLogo_width_out: [200, 50, { start: 0.4, end: 0.8 }],
        pencilLogo_translateX_in: [-10, -20, { start: 0.2, end: 0.4 }],
        pencilLogo_translateX_out: [-20, -50, { start: 0.4, end: 0.8 }],
        pencilLogo_opacity_out: [1, 0, { start: 0.8, end: 0.9 }],
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messageA_opacity_out: [1, 0, { start: 0.3, end: 0.4 }],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageA_translateY_out: [0, -20, { start: 0.3, end: 0.4 }],
        path_dashoffset_in: [1401, 0, { start: 0.2, end: 0.4 }],
        path_dashoffset_out: [0, -1401, { start: 0.6, end: 0.8 }],
        messageB_opacity_in: [0, 1, { start: 0.4, end: 0.5 }],
        messageB_opacity_out: [1, 0, { start: 0.6, end: 0.7 }],
        pencil_right: [-10, 70, { start: 0.3, end: 0.8 }],
        pencil_bottom: [-80, 100, { start: 0.3, end: 0.8 }],
        pencil_rotate: [-120, -200, { start: 0.3, end: 0.8 }],
      }
    }
  ];

  function setLayout() {
    for (let i = 0; i < sceneInfo.length; i++) {
      sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;

      sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
    }

    yOffset = window.pageYOffset;

    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }

    document.body.setAttribute("id", `show-scene-${currentScene}`);
  }

  function calcValues(values, currentYOffset) {
    let rv;

    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    if (values.length === 3) {
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;

      if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
        rv = ((currentYOffset - partScrollStart) / partScrollHeight) * (values[1] - values[0]) + values[0];
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
    const currentYOffset = yOffset - prevScrollHeight;
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;

    switch (currentScene) {
      case 0:
        if (scrollRatio <= 0.25) {
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_in,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_in,
            currentYOffset
          )}%, 0)`;
        } else {
          objs.messageA.style.opacity = calcValues(
            values.messageA_opacity_out,
            currentYOffset
          );
          objs.messageA.style.transform = `translate3d(0, ${calcValues(
            values.messageA_translateY_out,
            currentYOffset
          )}%, 0)`;
        }


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

        // 리본
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

    if (yOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      document.body.classList.remove("scroll-effect-end");
    }

    if (yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      enterNewScene = true;
      if (currentScene === sceneInfo.length - 1) {
        document.body.classList.add("scroll-effect-end");
      }
      if (currentScene < sceneInfo.length - 1) {
        currentScene++;
      }
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }

    if (yOffset < prevScrollHeight) {
      enterNewScene = true;

      // 신 하나전으로 돌리는거 같은데?
      if (currentScene === 0) return;
      currentScene--;
      document.body.setAttribute("id", `show-scene-${currentScene}`);
    }

    if (enterNewScene) return;

    playAnimation();
  }

  window.addEventListener("load", () => {
    document.body.classList.remove("before-load");
    setLayout();

    window.addEventListener("scroll", () => {
      yOffset = window.pageYOffset;
      scrollLoop();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        setLayout();
      }
    });

    window.addEventListener("orientationchange", () => {
      setTimeout(setLayout, 500);
    });

    document.querySelector(".loading").addEventListener("transitionend", (e) => {
      document.body.removeChild(e.currentTarget);
    });
  });
})();