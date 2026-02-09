import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFViewer.css';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFViewer = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        loadPDF();

        // Disable right-click context menu
        const handleContextMenu = (e) => e.preventDefault();

        // Disable text selection
        const handleSelectStart = (e) => e.preventDefault();

        // Disable keyboard shortcuts for saving/printing
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [unitId]);

    const loadPDF = async () => {
        try {
            setLoading(true);
            setError('');

            // 🔐 Call backend to get signed S3 URL
            const res = await axios.get(
                `http://localhost:5100/api/units/${unitId}/pdf`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const signedPdfUrl = res.data.url;
            console.log('Signed URL received:', signedPdfUrl);

            // Load PDF using pdf.js
            // Note: Don't set httpHeaders with CORS headers - those are response headers, not request headers
            const loadingTask = pdfjsLib.getDocument({
                url: signedPdfUrl,
                withCredentials: false,
                // Disable auto-fetch to handle errors better
                disableAutoFetch: false,
                disableStream: false
            });

            const pdf = await loadingTask.promise;

            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            setPageNum(1);
            renderPage(pdf, 1);
        } catch (error) {
            console.error('PDF loading error:', error);
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                status: error.status || error.response?.status,
                response: error.response?.data
            });

            // Handle backend API errors
            if (error.response) {
                if (error.response.status === 404) {
                    setError(error.response.data?.message || 'PDF not found. The file may not have been uploaded yet.');
                } else if (error.response.status === 403) {
                    setError('Access denied. Please check your permissions.');
                } else if (error.response.status === 400) {
                    setError(error.response.data?.message || 'Invalid request. Please contact support.');
                } else {
                    setError(`Server error: ${error.response.data?.message || error.response.statusText}`);
                }
                return;
            }

            // Handle PDF.js specific errors
            if (error.name === 'UnexpectedResponseException') {
                if (error.status === 400) {
                    setError('PDF file not found in S3. Please verify the file was uploaded correctly.');
                } else if (error.status === 403) {
                    setError('Access denied to PDF. The signed URL may have expired or permissions are incorrect.');
                } else if (error.status === 404) {
                    setError('PDF file not found in S3 storage.');
                } else {
                    setError(`Failed to load PDF: Server returned ${error.status}. Check browser console for details.`);
                }
            } else if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
                setError('CORS error: S3 bucket needs CORS configuration. See S3_CORS_SETUP.md for instructions.');
            } else if (error.message?.includes('Invalid PDF') || error.message?.includes('format')) {
                setError('Invalid PDF file format. Please check the file.');
            } else {
                setError(`Failed to load PDF: ${error.message || 'Unknown error'}. Check browser console for details.`);
            }
        } finally {
            setLoading(false);
        }
    };



    const renderPage = async (pdf, pageNumber) => {
        try {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            // Add watermark
            context.fillStyle = 'rgba(102, 126, 234, 0.1)';
            context.font = '20px Arial';
            context.fillText(`View Only - ${user?.email || 'User'}`, 20, 30);
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    };

    useEffect(() => {
        if (pdfDoc) {
            renderPage(pdfDoc, pageNum);
        }
    }, [pageNum, pdfDoc]);

    const goToPrevPage = () => {
        if (pageNum > 1) {
            setPageNum(pageNum - 1);
        }
    };

    const goToNextPage = () => {
        if (pageNum < numPages) {
            setPageNum(pageNum + 1);
        }
    };

    if (loading) {
        return (
            <div className="pdf-viewer">
                <div className="loading">Loading PDF...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pdf-viewer">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="pdf-viewer" ref={containerRef}>
            <Navbar />
            <nav className="viewer-navbar">
                <button onClick={() => navigate(-1)}>← Back</button>
                <div className="page-controls">
                    <button onClick={goToPrevPage} disabled={pageNum === 1}>
                        Previous
                    </button>
                    <span>
                        Page {pageNum} of {numPages}
                    </span>
                    <button onClick={goToNextPage} disabled={pageNum === numPages}>
                        Next
                    </button>
                </div>
                <div className="viewer-info">
                    <span>View Only - No Download</span>
                </div>
            </nav>
            <div className="pdf-container">
                <canvas
                    ref={canvasRef}
                    className="pdf-canvas"
                    style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        pointerEvents: 'none'
                    }}
                />
            </div>
            <div className="watermark-overlay">
                <div className="watermark-text">
                    View Only - {user?.email || 'User'}
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;

