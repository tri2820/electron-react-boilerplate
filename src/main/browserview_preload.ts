// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const electronHandler = {
  send: (arg: any) => ipcRenderer.invoke('browserview-message', arg),
};
contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== '';
}

function hashMap(input: number) {
  const str = `${input}`;
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return (hash >>> 0) / 4294967295;
}

export function queryDeepSelectorAll<T>(
  filter: (el: Element) => boolean,
  rootNode = document.body,
) {
  const traverser = (node: Element): Element[] => {
    if (node.nodeType !== Node.ELEMENT_NODE) return [];
    const childrenResults = Array.from(node.children).flatMap((c: any) =>
      traverser(c),
    );
    const { shadowRoot } = node;
    const shadowChildrenResults: Element[] = shadowRoot
      ? Array.from(shadowRoot.children).flatMap((c: any) => traverser(c))
      : [];

    const nested = [...childrenResults, ...shadowChildrenResults];
    if (nested.length === 0) {
      return filter(node) ? [node] : [];
    }
    return nested;
  };

  return traverser(rootNode);
}

function drawRoundedDottedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  let r = radius;
  if (width < 2 * radius) r = width / 2;
  if (height < 2 * radius) r = height / 2;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();

  ctx.setLineDash([5, 3]); // Sets the dash pattern for dotted lines
  ctx.stroke();
  ctx.setLineDash([]); // Resets the dash pattern to solid line
}

function main() {
  // Create a new canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'overlayCanvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.zIndex = '9999999999999999';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none'; // Allows click events to pass through

  // Append the canvas to the body
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  console.log('canvas', canvas, ctx);

  // Function to resize canvas and apply red overlay
  function rerender() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let visibleElements = queryDeepSelectorAll((el: Element) => {
      const clickable =
        [
          'A',
          'BUTTON',
          'INPUT',
          'TEXTAREA',
          'SELECT',
          'VIDEO',
          'DETAILS',
          'IFRAME',
          'IMG',
        ].includes(el.tagName) ||
        // (el as HTMLElement).onclick ||
        // window.getComputedStyle(el).cursor === 'pointer' ||
        window.getComputedStyle(el).cursor === 'text';
      const notNavigatable = (el.attributes as any).tabindex?.value === -1;
      if (!clickable || notNavigatable) return false;

      const rect = el.getBoundingClientRect();
      if (
        rect.x + rect.width < 0 ||
        rect.x > canvas.width ||
        rect.y + rect.height < 0 ||
        rect.y > canvas.height
      )
        return false;

      const area = rect.width * rect.height;
      if (area < 400) return false;

      return true;
    });

    visibleElements = visibleElements.filter((e) =>
      visibleElements.every((x) => {
        if (x === e) return true;
        const re = e.getBoundingClientRect();
        const rx = x.getBoundingClientRect();
        const xInside =
          re.left <= rx.left &&
          rx.right <= re.right &&
          re.top <= rx.top &&
          rx.bottom <= re.bottom;
        return !xInside;
      }),
    );

    visibleElements.reverse().forEach((el, i) => {
      ctx.beginPath();
      const rect = el.getBoundingClientRect();
      const seed = rect.width * rect.height;
      const colors = [
        'red',
        'green',
        'blue',
        // 'pink',
        // 'yellow',
        'orange',
        'darkblue',
        'forestgreen',
        'maroon',
        'sienna',
        // 'cyan',
      ];
      // Generate a random color
      const randomColor = colors[Math.floor(hashMap(seed) * colors.length)];

      ctx.strokeStyle = randomColor;
      ctx.lineWidth = 2; // Set the border width
      drawRoundedDottedRect(ctx, rect.x, rect.y, rect.width, rect.height, 10); // Adjust the radius as needed

      // Code to add label
      const labelText = `${i}`;
      const fontSize = 14;
      ctx.font = `${fontSize}px Arial`; // Set font for the text
      ctx.fillStyle = 'white'; // Text color
      ctx.textBaseline = 'top'; // Align text

      // Background for the text
      const textWidth = ctx.measureText(labelText).width;
      const textHeight = fontSize * 1.2; // Approximate text height
      const backgroundPadding = 4;
      ctx.fillStyle = randomColor; // Background color
      ctx.fillRect(
        rect.x,
        // + Math.floor(rect.width / 2)
        rect.y + rect.height,
        textWidth + backgroundPadding * 2,
        textHeight + backgroundPadding * 2,
      );

      // ctx.globalAlpha = 1; // Reset global alpha to default
      // Draw the text over the background
      ctx.fillStyle = 'white'; // Text color
      ctx.fillText(
        labelText,
        rect.x +
          // + Math.floor(rect.width / 2)
          backgroundPadding,
        rect.y + rect.height + backgroundPadding,
      );
    });

    // console.log(
    //   'visibleElements',
    //   visibleElements.map((e) => e.textContent?.trim().slice(0, 40)),
    // );
  }

  // // Resize initially
  // rerender();

  // Resize and reapply overlay when window is resized
  window.addEventListener('resize', rerender);

  // Update canvas on scroll
  window.addEventListener('scroll', rerender);

  // Fallback to rerender every interval
  setInterval(() => {
    rerender();
  }, 1000);
}

document.addEventListener('DOMContentLoaded', (event) => {
  main();
});
