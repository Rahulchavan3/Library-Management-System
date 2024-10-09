const express = require('express');
const {
    getBooks,
    borrowBook,
    returnBook,
    deleteOwnAccount,
    getUserLoans,
    getAllLoans,
    authorize,
    addBook,
    updateBook,
    deleteBook,
    addMember,
    updateMember,
    deleteMember,
    getAllMembers,
    getDeletedAndActiveMembers,
    getAllMembersHistory,
    getMemberHistory,
    getMemberByEmail
} = require('../Controllers/activity.controller');
const { authenticate } = require('../Middlewares/authMiddleware');

const router = express.Router();


router.get('/books', authenticate, getBooks); 

// Member routes
router.post('/borrow', authenticate, borrowBook); 
router.post('/return', authenticate, returnBook); 
router.get('/loans', authenticate, getUserLoans); 
router.delete('/account', authenticate, deleteOwnAccount); 
router.get('/history', authenticate, getMemberHistory); 


router.get('/loans/all', authenticate, authorize(['LIBRARIAN']), getAllLoans);
router.post('/Addbooks', authenticate, authorize(['LIBRARIAN']), addBook); 
router.put('/books/:id', authenticate, authorize(['LIBRARIAN']), updateBook); 
router.delete('/books/:id', authenticate, authorize(['LIBRARIAN']), deleteBook); 


router.post('/Addmembers', authenticate, authorize(['LIBRARIAN']), addMember); 
router.patch('/members/:id', authenticate, authorize(['LIBRARIAN']), updateMember);
router.delete('/members/delete/:id', authenticate, authorize(['LIBRARIAN']), deleteMember); 
 
router.get('/allMembers', authenticate, authorize(['LIBRARIAN']), getAllMembers); 
router.get('/members/status', authenticate, authorize(['LIBRARIAN']), getDeletedAndActiveMembers);
router.get('/members/history', authenticate, authorize(['LIBRARIAN']), getAllMembersHistory); 
router.get('/members/email', authenticate, authorize(['LIBRARIAN']), getMemberByEmail);
module.exports = router;
