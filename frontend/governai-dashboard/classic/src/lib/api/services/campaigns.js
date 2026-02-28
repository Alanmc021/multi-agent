import { apiRequest } from '@/lib/api/client';

/**
 * Lista todas as campanhas
 */
export async function listCampaigns({ status, offset, limit } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (offset) params.append('offset', offset);
  if (limit) params.append('limit', limit);
  
  const query = params.toString();
  const path = query ? `/campaigns?${query}` : '/campaigns';
  
  return await apiRequest(path, { method: 'GET' });
}

/**
 * Obtém uma campanha por ID
 */
export async function getCampaign(id) {
  return await apiRequest(`/campaigns/${id}`, { method: 'GET' });
}

/**
 * Cria uma nova campanha
 */
export async function createCampaign(data) {
  return await apiRequest('/campaigns', {
    method: 'POST',
    body: data,
  });
}

/**
 * Atualiza uma campanha
 */
export async function updateCampaign(id, data) {
  return await apiRequest(`/campaigns/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Deleta uma campanha
 */
export async function deleteCampaign(id) {
  return await apiRequest(`/campaigns/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Adiciona leads a uma campanha
 */
export async function addLeadsToCampaign(id, leadIds) {
  return await apiRequest(`/campaigns/${id}/leads`, {
    method: 'POST',
    body: { leadIds },
  });
}

/**
 * Obtém estatísticas de uma campanha
 */
export async function getCampaignStats(id) {
  return await apiRequest(`/campaigns/${id}/stats`, { method: 'GET' });
}

/**
 * Inicia uma campanha
 */
export async function startCampaign(id) {
  return await apiRequest(`/campaigns/${id}/start`, {
    method: 'POST',
  });
}

/**
 * Pausa uma campanha
 */
export async function pauseCampaign(id) {
  return await apiRequest(`/campaigns/${id}/pause`, {
    method: 'POST',
  });
}

/**
 * Para/Cancela uma campanha
 */
export async function stopCampaign(id) {
  return await apiRequest(`/campaigns/${id}/stop`, {
    method: 'POST',
  });
}

/**
 * Retoma uma campanha pausada
 */
export async function resumeCampaign(id) {
  return await apiRequest(`/campaigns/${id}/resume`, {
    method: 'POST',
  });
}

