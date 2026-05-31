import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

export interface UserMe {
  id: number
  username: string
  email: string
  role: 'admin' | 'participant'
  must_change_password: boolean
  participant_id: number | null
  participant_name: string | null
}

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  participant_id: number | null
  must_change_password: boolean
  created_at: string
}

export const useMe = () =>
  useQuery<UserMe>({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
    enabled: !!localStorage.getItem('jwt'),
    retry: false,
  })

export const useLogin = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { username: string; password: string }) =>
      api.post('/auth/login', body).then(r => r.data),
    onSuccess: (data: { access_token: string }) => {
      localStorage.setItem('jwt', data.access_token)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (body: { current_password: string; new_password: string }) =>
      api.post('/auth/change-password', body),
  })

export const logout = () => {
  localStorage.removeItem('jwt')
  window.location.href = '/'
}

export const useAdminUsers = () =>
  useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  })

export const useCreateAdminUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { username: string; email: string; role: string; participant_id?: number }) =>
      api.post('/admin/users', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export const useResetPassword = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => api.post(`/admin/users/${userId}/reset-password`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export const useDeleteAdminUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}
