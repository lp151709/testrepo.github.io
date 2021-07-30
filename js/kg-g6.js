currentData = null;
maxNode = null;

function refreshDragedNodePosition(e) {
  var model = e.item.get('model');
  model.fx = e.x;
  model.fy = e.y;
}

function processParallelEdges(
  edges,
  offsetDiff = 60,
  multiEdgeType = 'quadratic',
  singleEdgeType,
  loopEdgeType,
) {
  console.log("process edges...")
  const len = edges.length;
  const cod = offsetDiff * 2;
  const loopPosition = [
    'top',
    'top-right',
    'right',
    'bottom-right',
    'bottom',
    'bottom-left',
    'left',
    'top-left',
  ];
  const edgeMap = {};
  const tags = [];
  const reverses = {};
  for (let i = 0; i < len; i++) {
    const edge = edges[i];
    const { source, target } = edge;
    const sourceTarget = `${source}-${target}`;

    if (tags[i]) continue;
    if (!edgeMap[sourceTarget]) {
      edgeMap[sourceTarget] = [];
    }
    tags[i] = true;
    edgeMap[sourceTarget].push(edge);
    for (let j = 0; j < len; j++) {
      if (i === j) continue;
      const sedge = edges[j];
      const src = sedge.source;
      const dst = sedge.target;

      // 两个节点之间共同的边
      // 第一条的source = 第二条的target
      // 第一条的target = 第二条的source
      if (!tags[j]) {
        if (source === dst && target === src) {
          edgeMap[sourceTarget].push(sedge);
          tags[j] = true;
          reverses[`${src}|${dst}|${edgeMap[sourceTarget].length - 1}`] = true;
        } else if (source === src && target === dst) {
          edgeMap[sourceTarget].push(sedge);
          tags[j] = true;
        }
      }
    }
  }

  for (const key in edgeMap) {
    const arcEdges = edgeMap[key];
    const { length } = arcEdges;
    for (let k = 0; k < length; k++) {
      const current = arcEdges[k];
      if (current.source === current.target) {
        if (loopEdgeType) current.type = loopEdgeType;
        // 超过8条自环边，则需要重新处理
        current.loopCfg = {
          position: loopPosition[k % 8],
          dist: Math.floor(k / 8) * 20 + 50,
        };
        continue;
      }
      if (length === 1 && singleEdgeType && current.source !== current.target) {
        current.type = singleEdgeType;
        continue;
      }
      current.type = multiEdgeType;
      const sign =
        (k % 2 === 0 ? 1 : -1) * (reverses[`${current.source}|${current.target}|${k}`] ? -1 : 1);
      if (length % 2 === 1) {
        current.curveOffset = sign * Math.ceil(k / 2) * cod;
      } else {
        current.curveOffset = sign * (Math.floor(k / 2) * cod + offsetDiff);
      }
    }
  }
  return edges;
}

function changeLayer() {
  switch ($("#xselect").val()) {
    case "random":
      graph.getGraph().updateLayout({
        type: "random",
        gpuEnabled: true
      });
      break;
    case "force":
      graph.getGraph().updateLayout({
        type: "force",
        gpuEnabled: true,
        linkDistance: 280,
        preventOverlap: true,
        nodeSize: 70,
        nodeSpacing: 50,
      });
      break;
    case "fruchterman":
      graph.getGraph().updateLayout({
        type: "fruchterman",
        gpuEnabled: true,
        maxIteration: 1000,
        gravity: 1,
        speed: 5,
        clustering: false,
        linkDistance: 280,
        preventOverlap: true,
        nodeSize: 70,
        nodeSpacing: 50,
      });
      break;
    case "circular":
      graph.getGraph().updateLayout({
        type: "circular",
        gpuEnabled: true,
      });
      break;
    case "radial":
      graph.getGraph().updateLayout({
        type: "radial",
        gpuEnabled: true,
        unitRadius: 300,
        nodeSize: 70,
        nodeSpacing: 30,
        preventOverlap: true,
      });
      break;
    case "mds":
      graph.getGraph().updateLayout({
        type: "mds",
        gpuEnabled: true,
        linkDistance: 500,
      });
      break;
    case "dagre":
      graph.getGraph().updateLayout({
        type: "dagre",
        gpuEnabled: true,
        nodesep: 10,
        ranksep: 70,
        controlPoints: true,
      });
      break;
    case "concentric":
      graph.getGraph().updateLayout({
        type: "concentric",
        gpuEnabled: true,
        nodeSize: 50,
        minNodeSpacing: 30,
        preventOverlap: true,
        sortBy: "degree",
      });
      break;
    case "grid":
      graph.getGraph().updateLayout({
        type: "grid",
        gpuEnabled: true,
        begin: [20, 20],
      });
      break;
    case "comboForce":
      graph.getGraph().updateLayout({
        type: "comboForce",
        gpuEnabled: true,
        preventComboOverlap: true,
        preventNodeOverlap: true,
        preventOverlap: true,
      });
      break;
  }
}

// KGraph是专业的知识图谱组件，可以支持任意类型的三元组呈现
class KGraph {
  //静态帮助方法
  //扩展方法
  static extendGraph() {
    G6.registerNode(
      "kgnode",
      {
        afterDraw(cfg, group) {
          const size = cfg.size; //圆直径
          // 添加边框
          group.addShape("circle", {
            attrs: {
              x: 0,
              y: 0,
              r: size / 2,
              stroke: cfg.style.stroke,
              lineWidth: cfg.style.lineWidth,
            },
            name: "circle-shape",
          });
          if (cfg.dtype == 1) {
            //添加阴影
            group.addShape("circle", {
              attrs: {
                x: 0,
                y: 0,
                r: size / 2 + 2,
                stroke: cfg.style.lightStroke,
                lineWidth: 4,
              },
              name: "circle-shape2",
            });
          }
        },
        setState(name, value, item) {
          if (item.getModel().type == "kgnode") {
            var clicked = item.hasState("click");
            var activated = item.hasState("active");
            var group = item.getContainer();

            if (clicked) {
              group.findAllByName(
                "circle-shape2"
              )[0].attrs.stroke = item.getStateStyle("click").lightStroke;
              group.findAllByName("circle-shape")[0].attrs.lineWidth = 4;
            } else if (activated) {
              group.findAllByName("circle-shape2")[0].attrs.stroke = "";
              group.findAllByName("circle-shape")[0].attrs.lineWidth = 4;
            } else {
              group.findAllByName("circle-shape2")[0].attrs.stroke = "";
              group.findAllByName("circle-shape")[0].attrs.lineWidth = 2;
            }
          }
        },
        afterUpdate(cfg, node) {
          // console.log("afterupdate");
          // var group=node.getContainer();
        },
      },
      "image"
    );
  }
  // containerId: 嵌入图标的元素ID
  // defaultNode：默认节点样式
  // defaultEdge：默认边样式
  // defaultModes:默认交互模式
  constructor(containerId, defaultNode, defaultEdge, defaultModes) {
    KGraph.extendGraph(); //扩展注册
    this._containerId = containerId;
    let container = $("#" + containerId);

    if (typeof defaultNode === "undefined" || defaultNode === null) {
      defaultNode = {
        labelCfg: {
          position: "bottom",
          offset: 5,
          style: {
            fontSize: 18,
            fontWeight: 1000,
            fill: "#555",
            background: {
              fill: "#ffffff",
              stroke: "#ffffff",
              padding: [0, 0, 0, 2],
              radius: 2,
            },
          },
        },
      };
    }

    if (typeof defaultEdge === "undefined" || defaultEdge === null) {
      defaultEdge = {
        type: "quadratic",
        endArrow: true,
        color: "#8facbb",
        lineWidth: 12,
        labelCfg: {
          autoRotate: true,
          style: {
            //fontSize: 18,
            fontSize: 14,
            fill: "#8facbb",
            background: {
              fill: "#ffffff",
              stroke: "#ffffff",
              padding: [1, 1, 1, 1]
            },
          },
        },
        style: {
          endArrow: {
            path: G6.Arrow.vee(8, 10, 10),
            d: 15,
            fill: "#8facbb",
            stroke: "#8facbb",
          },
        },
      };
    }

    if (
      typeof defaultModes === "undefined" ||
      defaultModes === null ||
      defaultModes.length === 0
    ) {
      defaultModes = [
        "drag-canvas",
        "zoom-canvas",
        "drag-node",
        {
          type: "activate-relations",
          resetSelected: true,
        },
        "brush-select",
      ];
    }

    const toolbar = new G6.ToolBar({
      getContent: () => {
        const outDiv = document.createElement('div');
        outDiv.style.width = '850px';
        var a1 = "active", a2 = "";
        if (window.location.href.indexOf("relation.html") == -1) {
          a1 = ""; a2 = "active";
        }

        outDiv.innerHTML = `<ul>
            <li code="relation" class='g6-toolbar-text `+ a1 + `'>
              关系图谱
            </li>            
            <li code="abpath" class='g6-toolbar-text `+ a2 + `'>
              A->B路径
            </li>
            <li code='split' class='seperate'></li>
            <li code="layout">
              <input id="query1" class="xquery" type="text" placeholder="人物A">
              <span id="querymid" class="xquery">~</span>
              <input id="query2" class="xquery" type="text" placeholder="人物B">              
            </li>
            <li code="refresh">
              <a href="javascript:void(0);" id="searchBtn" title="检索">
                <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M953.504 908.256L800.896 744.96c61.856-74.496 95.872-167.36 95.872-265.12 0-229.344-186.624-415.968-416.032-415.968-229.344 0-415.968 186.592-415.968 415.968s186.624 415.968 416 415.968c60.096-0.032 118.048-12.576 172.224-37.248 16.096-7.328 23.2-26.304 15.872-42.368-7.328-16.128-26.4-23.264-42.368-15.872-45.856 20.864-94.88 31.456-145.76 31.488-194.08 0-351.968-157.888-351.968-351.968 0-194.048 157.888-351.968 351.968-351.968 194.112 0 352.032 157.888 352.032 351.968 0 91.36-34.848 177.92-98.08 243.744-12.256 12.736-11.84 32.992 0.864 45.248 0.96 0.928 2.208 1.28 3.296 2.08 0.864 1.28 1.312 2.752 2.4 3.904l165.504 177.088c6.272 6.752 14.816 10.144 23.36 10.144 7.84 0 15.68-2.848 21.856-8.64 12.896-12 13.6-32.256 1.536-45.152z" p-id="1260"></path>
                </svg>
              </a>
            </li> 
            <li code='split' class='seperate'></li>
            <li code="layout">
                <select id="xselect">
                    <option value="force">经典力导向布局</option>
                    <option value="random">随机布局</option>
                    <option value="fruchterman">FR力导向布局</option>
                    <option value="circular">环形布局</option>
                    <option value="radial">辐射状布局</option>
                    <option value="mds">高维数据降维算法布局</option>
                    <option value="dagre">层次布局</option>
                    <option value="concentric">同心圆布局</option>
                    <option value="grid">网格布局</option>
                    <option value="comboForce">分组力导向布局</option>
                </select>
            </li>
            <li code="refresh">
              <a href="javascript:void(0);" title="刷新">
                <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M768 184.32V128c0-30.72 20.48-51.2 51.2-51.2s51.2 20.48 51.2 51.2v204.8c0 30.72-20.48 51.2-51.2 51.2h-204.8c-30.72 0-51.2-20.48-51.2-51.2s20.48-51.2 51.2-51.2h112.64c-56.32-46.08-128-76.8-204.8-76.8C348.16 204.8 204.8 348.16 204.8 522.24c0 174.08 143.36 317.44 317.44 317.44 138.24 0 256-87.04 302.08-215.04 10.24-25.6 35.84-40.96 66.56-30.72 25.6 10.24 40.96 35.84 30.72 66.56-56.32 168.96-215.04 286.72-399.36 286.72-230.4 0-419.84-189.44-419.84-419.84C102.4 291.84 291.84 102.4 522.24 102.4c87.04 0 174.08 30.72 245.76 81.92z" p-id="3221"></path>
                </svg>
              </a>
            </li> 
            <li code='split' class='seperate'></li>
            <li code="zoomOut">
            <a href="javascript:void(0);" title="放大">
              <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M658.432 428.736a33.216 33.216 0 0 1-33.152 33.152H525.824v99.456a33.216 33.216 0 0 1-66.304 0V461.888H360.064a33.152 33.152 0 0 1 0-66.304H459.52V296.128a33.152 33.152 0 0 1 66.304 0V395.52H625.28c18.24 0 33.152 14.848 33.152 33.152z m299.776 521.792a43.328 43.328 0 0 1-60.864-6.912l-189.248-220.992a362.368 362.368 0 0 1-215.36 70.848 364.8 364.8 0 1 1 364.8-364.736 363.072 363.072 0 0 1-86.912 235.968l192.384 224.64a43.392 43.392 0 0 1-4.8 61.184z m-465.536-223.36a298.816 298.816 0 0 0 298.432-298.432 298.816 298.816 0 0 0-298.432-298.432A298.816 298.816 0 0 0 194.24 428.8a298.816 298.816 0 0 0 298.432 298.432z"></path>
              </svg>
              </a>
            </li> 
            <li code="zoomIn">
            <a href="javascript:void(0);" title="缩小">
              <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M639.936 416a32 32 0 0 1-32 32h-256a32 32 0 0 1 0-64h256a32 32 0 0 1 32 32z m289.28 503.552a41.792 41.792 0 0 1-58.752-6.656l-182.656-213.248A349.76 349.76 0 0 1 480 768 352 352 0 1 1 832 416a350.4 350.4 0 0 1-83.84 227.712l185.664 216.768a41.856 41.856 0 0 1-4.608 59.072zM479.936 704c158.784 0 288-129.216 288-288S638.72 128 479.936 128a288.32 288.32 0 0 0-288 288c0 158.784 129.216 288 288 288z" p-id="3853"></path>
              </svg>
              </a>
            </li>
            <li code="realZoom">
            <a href="javascript:void(0);" title="真实大小">
              <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="24">
                <path d="M384 320v384H320V320h64z m256 0v384H576V320h64zM512 576v64H448V576h64z m0-192v64H448V384h64z m355.968 576H92.032A28.16 28.16 0 0 1 64 931.968V28.032C64 12.608 76.608 0 95.168 0h610.368L896 192v739.968a28.16 28.16 0 0 1-28.032 28.032zM704 64v128h128l-128-128z m128 192h-190.464V64H128v832h704V256z"></path>
              </svg>
              </a>
            </li>
            <li code="autoZoom">
            <a href="javascript:void(0);" title="适应窗口">
              <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="24">
                <path d="M684.288 305.28l0.128-0.64-0.128-0.64V99.712c0-19.84 15.552-35.904 34.496-35.712a35.072 35.072 0 0 1 34.56 35.776v171.008h170.944c19.648 0 35.84 15.488 35.712 34.432a35.072 35.072 0 0 1-35.84 34.496h-204.16l-0.64-0.128a32.768 32.768 0 0 1-20.864-7.552c-1.344-1.024-2.816-1.664-3.968-2.816-0.384-0.32-0.512-0.768-0.832-1.088a33.472 33.472 0 0 1-9.408-22.848zM305.28 64a35.072 35.072 0 0 0-34.56 35.776v171.008H99.776A35.072 35.072 0 0 0 64 305.216c0 18.944 15.872 34.496 35.84 34.496h204.16l0.64-0.128a32.896 32.896 0 0 0 20.864-7.552c1.344-1.024 2.816-1.664 3.904-2.816 0.384-0.32 0.512-0.768 0.768-1.088a33.024 33.024 0 0 0 9.536-22.848l-0.128-0.64 0.128-0.704V99.712A35.008 35.008 0 0 0 305.216 64z m618.944 620.288h-204.16l-0.64 0.128-0.512-0.128c-7.808 0-14.72 3.2-20.48 7.68-1.28 1.024-2.752 1.664-3.84 2.752-0.384 0.32-0.512 0.768-0.832 1.088a33.664 33.664 0 0 0-9.408 22.912l0.128 0.64-0.128 0.704v204.288c0 19.712 15.552 35.904 34.496 35.712a35.072 35.072 0 0 0 34.56-35.776V753.28h170.944c19.648 0 35.84-15.488 35.712-34.432a35.072 35.072 0 0 0-35.84-34.496z m-593.92 11.52c-0.256-0.32-0.384-0.768-0.768-1.088-1.088-1.088-2.56-1.728-3.84-2.688a33.088 33.088 0 0 0-20.48-7.68l-0.512 0.064-0.64-0.128H99.84a35.072 35.072 0 0 0-35.84 34.496 35.072 35.072 0 0 0 35.712 34.432H270.72v171.008c0 19.84 15.552 35.84 34.56 35.776a35.008 35.008 0 0 0 34.432-35.712V720l-0.128-0.64 0.128-0.704a33.344 33.344 0 0 0-9.472-22.848zM512 374.144a137.92 137.92 0 1 0 0.128 275.84A137.92 137.92 0 0 0 512 374.08z"></path>
              </svg>
              </a>
            </li>
            <li code="download">
            <a href="javascript:void(0);" title="下载">
              <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="24">
                <path d="M469.312 570.24v-256h85.376v256h128L512 756.288 341.312 570.24h128zM1024 640.128C1024 782.912 919.872 896 787.648 896h-512C123.904 896 0 761.6 0 597.504 0 451.968 94.656 331.52 226.432 302.976 284.16 195.456 391.808 128 512 128c152.32 0 282.112 108.416 323.392 261.12C941.888 413.44 1024 519.04 1024 640.192zM764.8 434.816c-24.448-129.024-128.896-222.72-252.8-222.72-97.28 0-183.04 57.344-224.64 147.456l-9.28 20.224-20.928 2.944c-103.36 14.4-178.368 104.32-178.368 214.72 0 117.952 88.832 214.4 196.928 214.4h512c88.32 0 157.504-75.136 157.504-171.712 0-88.064-65.92-164.928-144.96-171.776l-29.504-2.56-5.888-30.976z" p-id="2479"></path>
              </svg>
            </a>
            </li>
          </ul>`
        return outDiv
      },
      handleClick: (code, graph) => {
        const currentZoom = graph.getZoom();
        console.log(code);
        switch (code) {
          case 'relation': {
            if (window.location.href.indexOf("relation-ab.html") != -1) {
              window.location.href = window.location.href.replace("relation-ab.html", "relation.html");
            }
          }
            break;
          case 'abpath': {
            if (window.location.href.indexOf("relation.html") != -1) {
              window.location.href = window.location.href.replace("relation.html", "relation-ab.html");
            }
          }
            break;
          case 'download': {
            var canvas = $("canvas")[0];
            var ctx = canvas.getContext("2d");
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < imageData.data.length; i += 4) {
              // 当该像素是透明的,则设置成白色
              if (imageData.data[i + 3] == 0) {
                imageData.data[i] = 255;
                imageData.data[i + 1] = 255;
                imageData.data[i + 2] = 255;
                imageData.data[i + 3] = 255;
              }
            }
            ctx.putImageData(imageData, 0, 0);

            var oA = document.createElement("a");
            oA.download = 'graph.png';// 设置下载的文件名，默认是'下载'
            oA.href = canvas.toDataURL("image/png");
            document.body.appendChild(oA);
            oA.click();
            oA.remove(); // 下载之后把创建的元素删除            
            //graph.downloadFullImage("graph.jpg",'image/jpeg');
          }
            break;
          case 'refresh': {
            changeLayer();
          }
            break;
          case 'zoomOut': {
            const ratioOut = 1 + 0.05 * 5;
            if (ratioOut * currentZoom > 5) {
              return;
            }
            graph.zoomTo(currentZoom * 1.1);
            break;
          }
          case 'zoomIn': {
            const ratioIn = 1 - 0.05 * 5;
            if (ratioIn * currentZoom < 0.3) {
              return;
            }
            graph.zoomTo(currentZoom * 0.9);
            break;
          }
          case 'realZoom':
            graph.zoomTo(1);
            break;
          case 'autoZoom':
            graph.fitView([20, 20]);
            break;
          default:
        }
      }
    });

    this.clickNode=null;

    this._graph = new G6.Graph({
      plugins: [toolbar],
      container: containerId,
      //renderer:"svg",
      width: container.width(),
      height: container.height(),
      defaultEdge: defaultEdge,
      defaultNode: defaultNode,
      layout: {
        type: "force",
        gpuEnabled: true,
        workerEnabled: true,
        linkDistance: 280,
        preventOverlap: true,
        nodeSize: 70,
        nodeSpacing: 50,
      },
      modes: {
        default: defaultModes,
      },
      nodeStateStyles: {
        click: {
          lineWidth: 4,
        },
      },
      edgeStateStyles: {
        active: {
          stroke: "#6c8998",
        },
      },
    });
    // let that=this;
    // that._graph.on('node:dragstart', function (e) {
    //   that._graph.layout();
    //   refreshDragedNodePosition(e);
    // });
    // that._graph.on('node:drag', function (e) {
    //   refreshDragedNodePosition(e);
    // });
    // that._graph.on('node:dragend', function (e) {
    //   e.item.get('model').fx = null;
    //   e.item.get('model').fy = null;
    // });
  }

  //KG方法
  //   data
  //    nodes  =>  节点数据
  //    edges  =>  边数据
  show(data, appended, nocached) {
    let that = this;
    if (nocached !== true) {
      var maxcount = 0;
      var dic = new Array();
      $.each(data.edges, function (i, e) {
        if (typeof (dic[e.source]) === "undefined") {
          dic[e.source] = 1;
        } else {
          dic[e.source] += 1;
        }

        if (dic[e.source] > maxcount) {
          maxcount = dic[e.source];
          maxNode = e.source;
        }

        if (typeof (dic[e.target]) === "undefined") {
          dic[e.target] = 1;
        } else {
          dic[e.target] += 1;
        }

        if (dic[e.target] > maxcount) {
          maxcount = dic[e.target];
          maxNode = e.target;
        }
      });
    }
    if (appended) {
      const nodes = this._graph.getNodes();
      var nodeIds = $.map(nodes, function (n, i) {
        return n.getModel().id;
      });
      $.each(data.nodes, function (i, n) {
        if (nodeIds.indexOf(n.id) == -1) {
          that._graph.addItem("node", n);
          currentData.nodes.push(n);
        }
      });
      data.edges = $.grep(data.edges, function (e, i) {
        return (
          nodeIds.indexOf(e.source) == -1 || nodeIds.indexOf(e.target) == -1
        );
      });
      processParallelEdges(data.edges);
      $.each(data.edges, function (i, e) {
        that._graph.addItem("edge", e);
        currentData.edges.push(e);
      });
      that._graph.layout();
      setTimeout(function () {
        that._graph.fitView([20, 20]);
      }, 500);
    } else {
      if (nocached !== true) {
        currentData = data;
      }
      processParallelEdges(data.edges);
      this._graph.data(data);
      this._graph.render();
      setTimeout(function () {
        that._graph.fitView([20, 20]);
      }, 500);
    }

    if (maxNode != null) {
      graph._graph.focusItem(graph._graph.findById(maxNode));
    }
  }

  //节点选择事件
  nodeClick(handler) {
    this._graph.on("node:click", (e) => {
      const clickNodes = this._graph.findAllByState("node", "click");
      clickNodes.forEach((cn) => {
        this._graph.setItemState(cn, "click", false);
      });
      const nodeItem = e.item;
      var model = e.item.getModel();
      this._graph.setItemState(nodeItem, "click", true);
      handler(model);
    });
  }

  nodeDoubleClick(handler) {
    this._graph.on("node:dblclick", (e) => {
      const clickNodes = this._graph.findAllByState("node", "click");
      clickNodes.forEach((cn) => {
        this._graph.setItemState(cn, "click", false);
      });
      const nodeItem = e.item;
      var model = e.item.getModel();
      this._graph.setItemState(nodeItem, "click", true);
      handler(model);
    });
  }

  filter(labels) {
    let that = this;

    var nodesId = [];
    var edges = [];

    $.each(currentData.edges, function (i, em) {
      if (labels.indexOf(em.label) != -1 && em.source==that.clickNode.id) {
        if (nodesId.indexOf(em.source) == -1) {
          nodesId.push(em.source);
        }
        if (nodesId.indexOf(em.target) == -1) {
          nodesId.push(em.target);
        }
        edges.push(em);
      }
    });

    if (nodesId.length == 0 && maxNode != null) {
      nodesId.push(maxNode);
    }

    var nodes = $.grep(currentData.nodes, function (n, i) {
      return nodesId.indexOf(n.id) != -1
    });

    this.show({ nodes, edges }, false, true);
  }

  getGraph() {
    return this._graph;
  }
}