import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000'

function App() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [metadata, setMetadata] = useState(null)
  const [showMetadata, setShowMetadata] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/files`)
      setFiles(response.data.files || [])
      setMessage({ type: '', text: '' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar arquivos' })
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Selecione um arquivo' })
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      setUploading(true)
      await axios.post(`${API_URL}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setMessage({ type: 'success', text: 'Arquivo enviado com sucesso!' })
      setSelectedFile(null)
      document.getElementById('fileInput').value = ''
      fetchFiles()
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao enviar arquivo' })
      console.error('Erro:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(`${API_URL}/files/${file.id}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setMessage({ type: 'success', text: 'Download iniciado!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao fazer download' })
      console.error('Erro:', error)
    }
  }

  const handleDelete = async (fileId) => {
    if (!window.confirm('Tem certeza que deseja deletar este arquivo?')) {
      return
    }

    try {
      await axios.delete(`${API_URL}/files/${fileId}`)
      setMessage({ type: 'success', text: 'Arquivo deletado com sucesso!' })
      fetchFiles()
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao deletar arquivo' })
      console.error('Erro:', error)
    }
  }

  const handleViewMetadata = async (fileId) => {
    try {
      const response = await axios.get(`${API_URL}/files/${fileId}/metadata`)
      setMetadata(response.data.metadata)
      setShowMetadata(true)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar metadados' })
      console.error('Erro:', error)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📁 File Manager</h1>
        <p>Cliente Web - Gateway API com HATEOAS</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="upload-section">
        <h2>📤 Upload de Arquivo</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-wrapper">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={uploading || !selectedFile}
          >
            {uploading ? 'Enviando...' : 'Enviar Arquivo'}
          </button>
        </form>
      </div>

      <div className="files-section">
        <h2>📋 Meus Arquivos ({files.length})</h2>
        
        {loading ? (
          <div className="loading">Carregando arquivos...</div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3>Nenhum arquivo encontrado</h3>
            <p>Faça upload de um arquivo para começar</p>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <h3>📄 {file.filename}</h3>
                <div className="file-id">ID: {file.id}</div>
                <div className="file-actions">
                  <button
                    onClick={() => handleDownload(file)}
                    className="btn btn-success"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => handleViewMetadata(file.id)}
                    className="btn btn-info"
                  >
                    ℹ️ Metadados
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="btn btn-danger"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMetadata && metadata && (
        <div className="metadata-modal" onClick={() => setShowMetadata(false)}>
          <div className="metadata-content" onClick={(e) => e.stopPropagation()}>
            <h3>📊 Metadados do Arquivo (SOAP)</h3>
            <div className="metadata-item">
              <strong>ID:</strong>
              <span>{metadata.id}</span>
            </div>
            <div className="metadata-item">
              <strong>Nome:</strong>
              <span>{metadata.name}</span>
            </div>
            <div className="metadata-item">
              <strong>Tamanho:</strong>
              <span>{metadata.size ? `${(metadata.size / 1024).toFixed(2)} KB` : 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <strong>Tipo:</strong>
              <span>{metadata.type}</span>
            </div>
            <div className="metadata-item">
              <strong>Encontrado:</strong>
              <span>{metadata.found ? '✅ Sim' : '❌ Não'}</span>
            </div>
            <button
              onClick={() => setShowMetadata(false)}
              className="btn btn-primary close-modal"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
