// Shared by the application and the isolated visual preview. No data access.
export function infoTipPosition(x: number, y: number, width: number, height: number, viewportWidth: number, viewportHeight: number) {
  const margin = 12, gap = 16;
  return {
    left: Math.max(margin, Math.min(x + gap, viewportWidth - width - margin)),
    top: Math.max(margin, y + gap + height <= viewportHeight - margin ? y + gap : Math.min(y - height - gap, viewportHeight - height - margin)),
  };
}

export function bindInfoTips(doc: Document) {
  let pinned: HTMLElement | null = null;
  let dismissed: HTMLElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => { if (timer) clearTimeout(timer); };
  const triggerFor = (popup: HTMLElement) => popup.parentElement?.querySelector<HTMLButtonElement>('.info-tip-trigger');
  const popupFor = (trigger: HTMLElement) => doc.getElementById(trigger.getAttribute('popovertarget') ?? '');
  const hide = (popup: HTMLElement) => {
    popup.dataset.open = 'false';
    triggerFor(popup)?.setAttribute('aria-expanded', 'false');
    if (popup.matches(':popover-open')) popup.hidePopover();
    if (pinned === popup) pinned = null;
  };
  const closeAll = () => doc.querySelectorAll<HTMLElement>('.info-tip-popup[data-open="true"]').forEach(hide);
  const place = (popup: HTMLElement, x: number, y: number) => {
    const viewport = doc.documentElement;
    popup.style.maxWidth = `${Math.max(1, viewport.clientWidth - 24)}px`;
    popup.style.maxHeight = `${Math.max(1, Math.min(420, viewport.clientHeight - 24))}px`;
    const bounds = popup.getBoundingClientRect();
    const position = infoTipPosition(x, y, bounds.width, bounds.height, viewport.clientWidth, viewport.clientHeight);
    popup.style.left = `${position.left}px`; popup.style.top = `${position.top}px`;
  };
  const show = (trigger: HTMLElement, event?: PointerEvent) => {
    const popup = popupFor(trigger); if (!popup) return;
    cancel();
    if (popup.dataset.open !== 'true') {
      closeAll();
      if (typeof popup.showPopover === 'function') popup.showPopover();
      popup.dataset.open = 'true';
      trigger.setAttribute('aria-expanded', 'true');
    }
    const bounds = trigger.getBoundingClientRect();
    place(popup, event?.clientX ?? bounds.left, event?.clientY ?? bounds.bottom);
  };
  const leave = (popup: HTMLElement) => {
    cancel();
    timer = setTimeout(() => {
      const trigger = triggerFor(popup);
      if (pinned !== popup && !popup.contains(doc.activeElement) && !(doc.activeElement === trigger && trigger?.matches(':focus-visible'))) hide(popup);
    }, 180);
  };
  const element = (event: Event) => event.target instanceof Element ? event.target : null;
  const over = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const target = element(event), wrapper = target?.closest('.info-tip');
    if (target?.closest('.info-tip-popup')) { cancel(); return; }
    if (!wrapper || (event.relatedTarget instanceof Node && wrapper.contains(event.relatedTarget))) return;
    cancel();
    const trigger = wrapper.querySelector<HTMLElement>('.info-tip-trigger');
    if (trigger) { dismissed = null; show(trigger, event); }
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const trigger = element(event)?.closest<HTMLElement>('.info-tip-trigger');
    if (!trigger || trigger === dismissed) return;
    const popup = popupFor(trigger);
    if (popup?.dataset.open === 'true' && pinned !== popup) place(popup, event.clientX, event.clientY);
  };
  const out = (event: PointerEvent) => {
    const wrapper = element(event)?.closest('.info-tip');
    if (!wrapper || (event.relatedTarget instanceof Node && wrapper.contains(event.relatedTarget))) return;
    const popup = wrapper.querySelector<HTMLElement>('.info-tip-popup');
    if (popup) leave(popup);
  };
  const focus = (event: FocusEvent) => {
    if (element(event)?.closest('.info-tip-popup')) { cancel(); return; }
    const trigger = element(event)?.closest<HTMLElement>('.info-tip-trigger');
    if (trigger) { dismissed = null; show(trigger); }
  };
  const blur = (event: FocusEvent) => {
    const wrapper = element(event)?.closest('.info-tip');
    const popup = wrapper?.querySelector<HTMLElement>('.info-tip-popup'); if (popup) leave(popup);
  };
  const click = (event: MouseEvent) => {
    const trigger = element(event)?.closest<HTMLElement>('.info-tip-trigger');
    if (!trigger) return;
    event.preventDefault();
    const popup = popupFor(trigger); if (!popup) return;
    if (pinned === popup && popup.dataset.open === 'true') { hide(popup); dismissed = trigger; }
    else { dismissed = null; show(trigger); pinned = popup; }
  };
  const outside = (event: PointerEvent) => { if (!element(event)?.closest('.info-tip')) closeAll(); };
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const opened = doc.querySelector<HTMLElement>('.info-tip-popup[data-open="true"]');
      dismissed = opened ? triggerFor(opened) ?? null : null;
      closeAll();
    }
  };
  const toggle = (event: Event) => {
    const popup = element(event);
    if (popup instanceof HTMLElement && popup.matches('.info-tip-popup') && !popup.matches(':popover-open')) hide(popup);
  };
  const scroll = (event: Event) => {
    if (element(event)?.closest('.info-tip-popup')) return;
    doc.querySelectorAll<HTMLElement>('.info-tip-popup[data-open="true"]').forEach(popup => {
      const trigger = triggerFor(popup);
      if (trigger && doc.activeElement === trigger && trigger.matches(':focus-visible')) show(trigger);
      else hide(popup);
    });
  };
  const listeners = { pointerover: over, pointermove: move, pointerout: out, focusin: focus, focusout: blur, click, pointerdown: outside, keydown: key, toggle, scroll };
  for (const [name, handler] of Object.entries(listeners)) doc.addEventListener(name, handler as EventListener, true);
  doc.defaultView?.addEventListener('resize', closeAll);
  return () => {
    cancel(); closeAll();
    for (const [name, handler] of Object.entries(listeners)) doc.removeEventListener(name, handler as EventListener, true);
    doc.defaultView?.removeEventListener('resize', closeAll);
  };
}
