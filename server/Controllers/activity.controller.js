

const axios = require('axios');
const bcrypt = require('bcrypt'); 
const dbUrl = process.env.DB_URL; 


const getBooks = async (req, res) => {
    try {
        const response = await axios.get(`${dbUrl}/books`);
        res.status(200).json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const borrowBook = async (req, res) => {
    const { bookId } = req.body; 
    const userId = req.user.id;

    try {

        const booksResponse = await axios.get(`${dbUrl}/books`);
        const books = booksResponse.data;

      
        const book = books.find(b => b.id === bookId);

        
        if (!book || book.available_copies <= 0) {
            return res.status(400).json({ message: 'Book is not available for borrowing' });
        }

      
        const loanRecord = {
            user_id: userId,
            book_id: bookId,
            loan_date: new Date().toISOString().split('T')[0], 
            return_date: null,
        };

     
        await axios.post(`${dbUrl}/loans`, loanRecord);

        
        const updatedAvailableCopies = book.available_copies - 1; 
        await axios.patch(`${dbUrl}/books/${bookId}`, { available_copies: updatedAvailableCopies }); // Update only available copies

        res.status(201).json({ message: 'Book borrowed successfully' });
    } catch (err) {
        console.error('Error borrowing book:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const returnBook = async (req, res) => {
    const { loanId } = req.body; 

    try {
        
        const loanResponse = await axios.get(`${dbUrl}/loans/${loanId}`);
        const loan = loanResponse.data;

        if (!loan) {
            return res.status(404).json({ message: 'Loan record not found' });
        }


        const updatedLoan = { ...loan, return_date: new Date().toISOString().split('T')[0] };
        await axios.put(`${dbUrl}/loans/${loanId}`, updatedLoan);

        
        const bookResponse = await axios.get(`${dbUrl}/books/${loan.book_id}`);
        const book = bookResponse.data;
        await axios.put(`${dbUrl}/books/${loan.book_id}`, { ...book, available_copies: book.available_copies + 1 });

        res.status(200).json({ message: 'Book returned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const deleteOwnAccount = async (req, res) => {
    const userId = req.user.id; 

    try {
     
        const response = await axios.get(`${dbUrl}/users/${userId}`);
        const member = response.data;

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

      
        if (member.isDeleted) {
            return res.status(400).json({ message: 'Account is already deleted' });
        }

        
        const updatedMember = {
            ...member,
            isDeleted: true 
        };

       
        await axios.put(`${dbUrl}/users/${userId}`, updatedMember);

        res.status(200).json({ message: 'Account soft-deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const getUserLoans = async (req, res) => {
    const userId = req.user.id; 

    try {
        const response = await axios.get(`${dbUrl}/loans?user_id=${userId}`);
        res.status(200).json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getAllLoans = async (req, res) => {
    try {
        const response = await axios.get(`${dbUrl}/loans`);
        res.status(200).json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const addBook = async (req, res) => {
    const { title, author, published_year, available_copies } = req.body;

    try {
        const newBook = {
            title,
            author,
            published_year,
            available_copies,
        };

        await axios.post(`${dbUrl}/books`, newBook);
        res.status(201).json({ message: 'Book added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const updateBook = async (req, res) => {
    const bookId = req.params.id; 
    if (!bookId) {
        return res.status(400).json({ message: 'Book ID is required' });
    }


    const updatedData = {};


    if (req.body.title) {
        updatedData.title = req.body.title; 
    }
    if (req.body.author) {
        updatedData.author = req.body.author; 
    }
    if (req.body.available_copies) {
        updatedData.available_copies = req.body.available_copies; 
    }
    if (req.body.published_year) {
        updatedData.published_year = req.body.published_year; 
    }


    try {
        
        await axios.patch(`${dbUrl}/books/${bookId}`, updatedData);
        res.status(200).json({ message: 'Book updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        await axios.delete(`${dbUrl}/books/${id}`);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const authorize = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
        }
        next();
    };
};



const addMember = async (req, res) => {
    const { username, email, password, role } = req.body; 
    try {
    
        const existingUsersResponse = await axios.get(`${dbUrl}/users`);
        const userExists = existingUsersResponse.data.find(user => user.email === email);

        if (userExists) {
            return res.status(409).json({ message: 'User Already Exists, please login', success: false });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10); 

       
        const newMember = {
            username,
            email,
            password: hashedPassword, 
            role: role || 'MEMBER', 
            isDeleted: false
        };

       
        await axios.post(`${dbUrl}/users`, newMember);
        res.status(201).json({ message: 'Member added successfully' });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: 'Internal server error' });
    }
};



const updateMember = async (req, res) => {
    const { id } = req.params; 
    const { username, email, role } = req.body; 

    try {
  
        const updatedData = {};
        if (username) updatedData.username = username; 
        if (email) updatedData.email = email; 
        if(role) updatedData.role = role; 


        await axios.patch(`${dbUrl}/users/${id}`, updatedData);

        res.status(200).json({ message: 'Member updated successfully' });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: 'Internal server error' }); 
    }
};


const deleteMember = async (req, res) => {
    const { id } = req.params;

    try {

        const response = await axios.get(`${dbUrl}/users/${id}`);
        const member = response.data;

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }


        if (member.isDeleted) {
            return res.status(400).json({ message: 'Member is already deleted' });
        }


        const updatedMember = {
            ...member,
            isDeleted: true 
        };


        await axios.put(`${dbUrl}/users/${id}`, updatedMember);

        res.status(200).json({ message: 'Member soft-deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};




const getAllMembers = async (req, res) => {
    try {
        const response = await axios.get(`${dbUrl}/users`);
        const activeMembers = response.data.filter(member => !member.isDeleted); 
        res.status(200).json(activeMembers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};





const getDeletedAndActiveMembers = async (req, res) => {
    try {
        const response = await axios.get(`${dbUrl}/users`);
        const activeMembers = response.data.filter(member => !member.isDeleted);
        const deletedMembers = response.data.filter(member => member.isDeleted);

        res.status(200).json({ activeMembers, deletedMembers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const getAllMembersHistory = async (req, res) => {
    try {
        const response = await axios.get(`${dbUrl}/loans`);
        res.status(200).json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getMemberHistory = async (req, res) => {
    const userId = req.user.id; 

    try {
        const response = await axios.get(`${dbUrl}/loans?user_id=${userId}`);
        res.status(200).json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMemberByEmail = async (req, res) => {
    const { email } = req.body;

    try {

        const response = await axios.get(`${dbUrl}/users?email=${email}`);
        const users = response.data;


        if (users.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }


        const user = users[0]; 
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    getBooks,
    borrowBook,
    returnBook,
    getUserLoans,
    deleteOwnAccount,
    getAllLoans,
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
    getMemberByEmail,
    authorize,
};