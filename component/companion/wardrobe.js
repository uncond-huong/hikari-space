import { activeEquippedState } from './core.js';

export function updateBaseBodyVisibility(characterId) {
  const baseBodyImg = document.getElementById(`${characterId}-base`);
  const equipped = activeEquippedState[characterId];
  
  const isWearingAnything = Object.values(equipped).some(item => item !== null);
  const componentLayers = document.querySelectorAll(`[id^="${characterId}-"]:not([id$="-base"])`);

  if (isWearingAnything) {
    if (baseBodyImg) baseBodyImg.classList.add("hidden");
    componentLayers.forEach(layer => layer.classList.remove("hidden"));
  } else {
    if (baseBodyImg) baseBodyImg.classList.remove("hidden");
    componentLayers.forEach(layer => layer.classList.add("hidden"));
  }
}

export function equipItem(characterId, slot, itemImgUrl, itemId) {
  if (!activeEquippedState[characterId]) return;

  activeEquippedState[characterId][slot] = itemId;

  const layerElement = document.getElementById(`${characterId}-${slot}`);
  if (layerElement) {
    if (itemImgUrl) {
      layerElement.src = itemImgUrl;
      layerElement.classList.remove("hidden");
    } else {
      layerElement.classList.add("hidden");
    }
  }

  updateBaseBodyVisibility(characterId);
}