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

    // const loadPDF = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.get(`/api/units/${unitId}/pdf`, {
    //             responseType: 'blob',
    //             headers: {
    //                 Authorization: `Bearer ${localStorage.getItem('token')}`
    //             }
    //         });

    //         const blob = new Blob([response.data], { type: 'application/pdf' });
    //         const url = URL.createObjectURL(blob);

    //         const loadingTask = pdfjsLib.getDocument({ url });
    //         const pdf = await loadingTask.promise;

    //         setPdfDoc(pdf);
    //         setNumPages(pdf.numPages);
    //         setPageNum(1);
    //         renderPage(pdf, 1);
    //     } catch (error) {
    //         setError('Failed to load PDF');
    //         console.error(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const loadPDF = async () => {
        try {
            setLoading(true);

            // Step 1: get unit details to fetch pdfPath
            const unitRes = await axios.get(`http://localhost:5100/api/units/${unitId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const pdfPath = unitRes.data.pdfPath; // data_structure_ii/sem2/unit1.pdf
            const pdfUrl = `http://localhost:5100/uploads/${pdfPath}`;

            const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
            const pdf = await loadingTask.promise;

            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            setPageNum(1);
            renderPage(pdf, 1);
        } catch (error) {
            console.error(error);
            setError('Failed to load PDF');
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

