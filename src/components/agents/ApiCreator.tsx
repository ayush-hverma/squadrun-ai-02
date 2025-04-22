import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Server, FileDown, ChevronsUpDown, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CodeDisplay from "../CodeDisplay";
import { useToast } from "@/hooks/use-toast";
import { AutogrowingTextarea } from "@/components/ui/autogrowing-textarea";
import ModelPicker from "@/components/ModelPicker";

interface ApiCreatorProps {
  fileContent?: string | null;
  fileName?: string | null;
}

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody: string;
  response: string;
}

interface DataModel {
  name: string;
  schema: string;
}

interface ApiPlan {
  overview: {
    purpose: string;
    techStack: string;
    architecture: string;
  };
  endpoints: ApiEndpoint[];
  dataModels: DataModel[];
  implementation: {
    setup: string;
    authentication?: string;
    middleware?: string;
    routes?: string;
  };
  security: string[];
  deployment: string[];
}

export default function ApiCreator({
  fileContent,
  fileName
}: ApiCreatorProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState<string>(fileContent ? `Create an API based on this code:\n\n${fileContent.substring(0, 200)}...` : "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiPlan, setApiPlan] = useState<ApiPlan | null>(null);
  const [model, setModel] = useState<"gemini" | "openai" | "groq">("openai");

  const analyzeRequirements = (text: string): ApiPlan => {
    const isAuthRequired = /auth|login|register|sign|user/i.test(text);
    const isEcommerce = /ecommerce|product|cart|order|payment|shop/i.test(text);
    const isTodo = /todo|task|list|item/i.test(text);
    const isBlog = /blog|post|article|comment/i.test(text);
    const isFileSystem = /file|upload|download|storage/i.test(text);
    if (isEcommerce) {
      return generateEcommerceApi();
    } else if (isTodo) {
      return generateTodoApi();
    } else if (isBlog) {
      return generateBlogApi();
    } else if (isFileSystem) {
      return generateFileSystemApi();
    } else {
      return generateUserManagementApi(isAuthRequired);
    }
  };

  const generateUserManagementApi = (includeAuth: boolean = true): ApiPlan => {
    return {
      overview: {
        purpose: "User management API for handling authentication and profile data",
        techStack: "Node.js, Express, MongoDB, JWT authentication",
        architecture: "RESTful API with MVC pattern"
      },
      endpoints: [{
        method: "POST",
        path: "/api/auth/register",
        description: "Register a new user",
        requestBody: "{ \"username\": \"string\", \"email\": \"string\", \"password\": \"string\" }",
        response: "{ \"id\": \"string\", \"username\": \"string\", \"email\": \"string\", \"token\": \"string\" }"
      }, {
        method: "POST",
        path: "/api/auth/login",
        description: "Authenticate a user",
        requestBody: "{ \"email\": \"string\", \"password\": \"string\" }",
        response: "{ \"id\": \"string\", \"username\": \"string\", \"token\": \"string\" }"
      }, {
        method: "GET",
        path: "/api/users/profile",
        description: "Get user profile",
        requestBody: "No body (JWT in Authorization header)",
        response: "{ \"id\": \"string\", \"username\": \"string\", \"email\": \"string\", \"profile\": { ... } }"
      }, {
        method: "PUT",
        path: "/api/users/profile",
        description: "Update user profile",
        requestBody: "{ \"username\": \"string\", \"bio\": \"string\", ... }",
        response: "{ \"id\": \"string\", \"username\": \"string\", \"profile\": { ... } }"
      }],
      dataModels: [{
        name: "User",
        schema: `const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  profile: {
    bio: String,
    location: String,
    website: String,
    avatar: String
  }
});`
      }],
      implementation: {
        setup: `// Install dependencies
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv

// Create server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
        authentication: `// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  profile: {
    bio: String,
    location: String,
    website: String,
    avatar: String
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);`,
        middleware: `// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};`
      },
      security: ["Use HTTPS in production", "Implement rate limiting", "Validate all inputs", "Apply proper authentication/authorization", "Use environment variables for secrets"],
      deployment: ["Set up CI/CD pipeline with GitHub Actions", "Deploy API on AWS, Heroku, or similar cloud provider", "Configure environment variables in deployment platform", "Set up monitoring with tools like New Relic or DataDog"]
    };
  };

  const generateTodoApi = (): ApiPlan => {
    return {
      overview: {
        purpose: "Task management API for creating and managing to-do items",
        techStack: "Node.js, Express, MongoDB, JWT authentication",
        architecture: "RESTful API with CRUD operations"
      },
      endpoints: [{
        method: "GET",
        path: "/api/tasks",
        description: "Get all tasks for the authenticated user",
        requestBody: "No body (JWT in Authorization header)",
        response: "[{ \"id\": \"string\", \"title\": \"string\", \"completed\": boolean, \"createdAt\": \"date\" }]"
      }, {
        method: "POST",
        path: "/api/tasks",
        description: "Create a new task",
        requestBody: "{ \"title\": \"string\", \"description\": \"string\", \"dueDate\": \"date\" }",
        response: "{ \"id\": \"string\", \"title\": \"string\", \"description\": \"string\", \"completed\": false }"
      }, {
        method: "PUT",
        path: "/api/tasks/:id",
        description: "Update an existing task",
        requestBody: "{ \"title\": \"string\", \"description\": \"string\", \"completed\": boolean }",
        response: "{ \"id\": \"string\", \"title\": \"string\", \"description\": \"string\", \"completed\": boolean }"
      }, {
        method: "DELETE",
        path: "/api/tasks/:id",
        description: "Delete a task",
        requestBody: "No body (JWT in Authorization header)",
        response: "{ \"message\": \"Task deleted\" }"
      }],
      dataModels: [{
        name: "Task",
        schema: `const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});`
      }],
      implementation: {
        setup: `// Install dependencies
npm init -y
npm install express mongoose jsonwebtoken cors dotenv

// Create server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
        routes: `// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a task
router.post('/', auth, async (req, res) => {
  const { title, description, dueDate } = req.body;
  
  try {
    const newTask = new Task({
      title,
      description,
      dueDate,
      user: req.user.id
    });
    
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  const { title, description, completed } = req.body;
  
  // Build task object
  const taskFields = {};
  if (title !== undefined) taskFields.title = title;
  if (description !== undefined) taskFields.description = description;
  if (completed !== undefined) taskFields.completed = completed;
  
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    // Make sure user owns task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    // Make sure user owns task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await Task.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;`
      },
      security: ["Implement JWT authentication", "Validate task ownership for all operations", "Sanitize and validate input data", "Implement rate limiting for API endpoints"],
      deployment: ["Deploy using Docker containers", "Set up MongoDB Atlas for database hosting", "Implement CI/CD pipeline with automated testing", "Set up monitoring for API performance"]
    };
  };

  const generateEcommerceApi = (): ApiPlan => {
    return {
      overview: {
        purpose: "E-commerce API for product management, shopping cart, and order processing",
        techStack: "Node.js, Express, MongoDB, Stripe for payments",
        architecture: "RESTful API with product catalog, cart, and order management"
      },
      endpoints: [{
        method: "GET",
        path: "/api/products",
        description: "Get all products with optional filtering",
        requestBody: "No body, query parameters for filtering",
        response: "[{ \"id\": \"string\", \"name\": \"string\", \"price\": number, \"description\": \"string\", \"image\": \"string\" }]"
      }, {
        method: "GET",
        path: "/api/products/:id",
        description: "Get a single product by ID",
        requestBody: "No body",
        response: "{ \"id\": \"string\", \"name\": \"string\", \"price\": number, \"description\": \"string\", \"image\": \"string\", \"stock\": number }"
      }, {
        method: "POST",
        path: "/api/cart",
        description: "Add item to cart",
        requestBody: "{ \"productId\": \"string\", \"quantity\": number }",
        response: "{ \"items\": [{ \"product\": {...}, \"quantity\": number, \"price\": number }], \"total\": number }"
      }, {
        method: "POST",
        path: "/api/orders",
        description: "Create an order from cart",
        requestBody: "{ \"shippingAddress\": { \"street\": \"string\", \"city\": \"string\", \"postalCode\": \"string\", \"country\": \"string\" }, \"paymentMethod\": \"string\" }",
        response: "{ \"id\": \"string\", \"items\": [...], \"total\": number, \"status\": \"string\", \"createdAt\": \"date\" }"
      }],
      dataModels: [{
        name: "Product",
        schema: `const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});`
      }, {
        name: "Order",
        schema: `const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});`
      }],
      implementation: {
        setup: `// Install dependencies
npm init -y
npm install express mongoose stripe cors dotenv jsonwebtoken

// Create server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
        routes: `// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Create a product (admin only)
router.post('/', [auth, admin], async (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  
  try {
    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category,
      stock
    });
    
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;`
      },
      security: ["Implement secure payment processing with Stripe", "Apply role-based access control for admin operations", "Validate products stock before order placement", "Implement transaction history for order tracking"],
      deployment: ["Set up separate environments for development, staging, and production", "Implement automated database backups", "Set up order notification system via email", "Configure CDN for product images"]
    };
  };

  const generateBlogApi = (): ApiPlan => {
    return {
      overview: {
        purpose: "Blog API for creating and managing blog posts and comments",
        techStack: "Node.js, Express, MongoDB, JWT authentication",
        architecture: "RESTful API with content management features"
      },
      endpoints: [{
        method: "GET",
        path: "/api/posts",
        description: "Get all blog posts with pagination",
        requestBody: "No body, query parameters for pagination",
        response: "{ \"posts\": [{ \"id\": \"string\", \"title\": \"string\", \"excerpt\": \"string\", \"author\": {...} }], \"total\": number, \"page\": number, \"totalPages\": number }"
      }, {
        method: "GET",
        path: "/api/posts/:id",
        description: "Get a single blog post with comments",
        requestBody: "No body",
        response: "{ \"id\": \"string\", \"title\": \"string\", \"content\": \"string\", \"author\": {...}, \"comments\": [...] }"
      }, {
        method: "POST",
        path: "/api/posts",
        description: "Create a new blog post",
        requestBody: "{ \"title\": \"string\", \"content\": \"string\", \"tags\": [\"string\"] }",
        response: "{ \"id\": \"string\", \"title\": \"string\", \"content\": \"string\", \"createdAt\": \"date\" }"
      }, {
        method: "POST",
        path: "/api/posts/:id/comments",
        description: "Add a comment to a blog post",
        requestBody: "{ \"content\": \"string\" }",
        response: "{ \"id\": \"string\", \"content\": \"string\", \"author\": {...}, \"createdAt\": \"date\" }"
      }],
      dataModels: [{
        name: "Post",
        schema: `const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});`
      }, {
        name: "Comment",
        schema: `const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});`
      }],
      implementation: {
        setup: `// Install dependencies
npm init -y
npm install express mongoose jsonwebtoken cors dotenv

// Create server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
        routes: `// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get all posts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username');
    
    res.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username'
        }
      });
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  const { title, content, tags } = req.body;
  
  try {
    // Create an excerpt from the content
    const excerpt = content.substring(0, 150) + '...';
    
    const newPost = new Post({
      title,
      content,
      excerpt,
      author: req.user.id,
      tags
    });
    
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  const { content } = req.body;
  
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const newComment = new Comment({
      content,
      post: req.params.id,
      author: req.user.id
    });
    
    const comment = await newComment.save();
    
    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();
    
    await comment.populate('author', 'username').execPopulate();
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;`
      },
      security: ["Implement content validation", "Add CSRF protection", "Configure rate limiting for comments", "Add moderation features for comments"],
      deployment: ["Set up content backup strategy", "Configure caching for popular blog posts", "Set up SEO-friendly URL structure", "Implement analytics for tracking post engagement"]
    };
  };

  const generateFileSystemApi = (): ApiPlan => {
    return {
      overview: {
        purpose: "File storage API for uploading, storing, and sharing files",
        techStack: "Node.js, Express, MongoDB, AWS S3 for storage",
        architecture: "RESTful API with file management capabilities"
      },
      endpoints: [{
        method: "POST",
        path: "/api/files/upload",
        description: "Upload a file",
        requestBody: "FormData with 'file' field",
        response: "{ \"id\": \"string\", \"filename\": \"string\", \"url\": \"string\", \"size\": number, \"mimetype\": \"string\" }"
      }, {
        method: "GET",
        path: "/api/files",
        description: "Get list of user's files",
        requestBody: "No body (JWT in Authorization header)",
        response: "[{ \"id\": \"string\", \"filename\": \"string\", \"url\": \"string\", \"size\": number, \"uploaded\": \"date\" }]"
      }, {
        method: "GET",
        path: "/api/files/:id",
        description: "Get file details",
        requestBody: "No body",
        response: "{ \"id\": \"string\", \"filename\": \"string\", \"url\": \"string\", \"size\": number, \"mimetype\": \"string\", \"uploaded\": \"date\" }"
      }, {
        method: "DELETE",
        path: "/api/files/:id",
        description: "Delete a file",
        requestBody: "No body (JWT in Authorization header)",
        response: "{ \"message\": \"File deleted successfully\" }"
      }],
      dataModels: [{
        name: "File",
        schema: `const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  encoding: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  public: {
    type: Boolean,
    default: false
  },
  uploaded: {
    type: Date,
    default: Date.now
  }
});`
      }],
      implementation: {
        setup: `// Install dependencies
npm init -y
npm install express mongoose aws-sdk multer multer-s3 cors dotenv jsonwebtoken

// Create server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
        routes: `// config/s3.js
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

// Set up file filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, PNG, PDF and DOC are allowed!'), false);
  }
};

// Set up multer middleware
const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = \`\${Date.now().toString()}-\${file.originalname}\`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;

// routes/files.js
const express = require('express');
const router = express.Router();
const File = require('../models/File');
const auth = require('../middleware/auth');
const upload = require('../config/s3');
const aws = require('aws-sdk');

// Upload a file
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }
    
    const newFile = new File({
      filename: file.key,
      originalName: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      url: file.location,
      key: file.key,
      owner: req.user.id
    });
    
    await newFile.save();
    
    res.json(newFile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all user files
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id }).sort({ uploaded: -1 });
    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a single file
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }
    
    // Check if user owns the file or if file is public
    if (file.owner.toString() !== req.user.id && !file.public) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(file);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'File not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Delete a file
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }
    
    // Check if user owns the file
    if (file.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Delete from S3
    const s3 = new aws.S3();
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.key
    }).promise();
    
    // Delete from database
    await file.remove();
    
    res.json({ msg: 'File deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'File not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;`
      },
      security: ["Implement file type validation", "Set up file size limits", "Configure proper AWS IAM permissions", "Add virus scanning for uploaded files"],
      deployment: ["Set up CDN for faster file delivery", "Configure S3 lifecycle policies for storage optimization", "Set up file access logging", "Implement backup strategy for critical files"]
    };
  };

  const handleCreateApi = () => {
    if (description.trim() === "") return;
    setIsProcessing(true);

    // Create a timeout to simulate processing
    setTimeout(() => {
      try {
        // Analyze the requirements and generate an appropriate API plan
        const generatedApiPlan = analyzeRequirements(description);
        setApiPlan(generatedApiPlan);
        toast({
          title: "API Plan Generated",
          description: "Your custom API plan has been created based on your requirements."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate API plan. Please try again.",
          variant: "destructive"
        });
        console.error("Error generating API plan:", error);
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleClear = () => {
    setApiPlan(null);
    setDescription("");
    toast({
      title: "API plan cleared",
      description: "You can now create a new API plan.",
    });
  };

  if (!apiPlan) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">API Creator</h1>
          <p className="text-squadrun-gray">
            Convert code or natural language descriptions into production-ready API designs and implementation plans.
          </p>
        </div>
        
        <Card className="flex-1 border border-squadrun-primary/20 bg-squadrun-darker/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Describe Your API Requirements</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-60px)]">
            <AutogrowingTextarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Describe the API you want to create. You can include details about endpoints, data models, authentication requirements, etc." 
              className="bg-squadrun-darker border-squadrun-primary/20 text-white" 
            />
          </CardContent>
        </Card>
        
        <div className="flex gap-2 justify-end mt-4">
          <Button onClick={handleClear} variant="destructive" disabled={!description}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
          <Button 
            onClick={handleCreateApi} 
            className="bg-squadrun-primary hover:bg-squadrun-vivid text-white" 
            disabled={isProcessing || description.trim() === ""}
          >
            {isProcessing ? 'Processing...' : (
              <>
                <Server className="mr-2 h-4 w-4" /> Generate API Plan
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">API Implementation Plan</h1>
        <p className="text-squadrun-gray">
          Complete roadmap for implementing a production-ready API based on your requirements.
        </p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="data-models">Data Models</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="security-deployment">Security & Deployment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">API Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Purpose</h3>
                    <p className="text-sm text-squadrun-gray">{apiPlan.overview.purpose}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Recommended Tech Stack</h3>
                    <p className="text-sm text-squadrun-gray">{apiPlan.overview.techStack}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Architecture</h3>
                    <p className="text-sm text-squadrun-gray">{apiPlan.overview.architecture}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="endpoints" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiPlan.endpoints.map((endpoint: ApiEndpoint, index: number) => <div key={index} className="border border-squadrun-primary/10 rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 text-xs rounded mr-2 ${endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-300' : endpoint.method === 'POST' ? 'bg-green-500/20 text-green-300' : endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' : endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-300' : 'bg-purple-500/20 text-purple-300'}`}>
                          {endpoint.method}
                        </span>
                        <span className="text-white font-mono">{endpoint.path}</span>
                      </div>
                      <p className="text-sm text-squadrun-gray mb-3">{endpoint.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-squadrun-gray mb-1">Request</h4>
                          <div className="bg-squadrun-darker rounded p-2">
                            <pre className="text-xs text-white whitespace-pre-wrap">{endpoint.requestBody}</pre>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs text-squadrun-gray mb-1">Response</h4>
                          <div className="bg-squadrun-darker rounded p-2">
                            <pre className="text-xs text-white whitespace-pre-wrap">{endpoint.response}</pre>
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data-models" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Data Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiPlan.dataModels.map((model: DataModel, index: number) => <div key={index} className="border border-squadrun-primary/10 rounded-md p-4">
                      <h3 className="text-sm font-medium text-white mb-2">{model.name} Schema</h3>
                      <CodeDisplay code={model.schema} language="javascript" />
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="implementation" className="mt-0">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Implementation Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="setup">
                    <AccordionTrigger className="text-sm font-medium text-white">
                      Project Setup
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeDisplay code={apiPlan.implementation.setup} language="javascript" />
                    </AccordionContent>
                  </AccordionItem>
                  {apiPlan.implementation.authentication && <AccordionItem value="auth">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        User Authentication
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay code={apiPlan.implementation.authentication} language="javascript" />
                      </AccordionContent>
                    </AccordionItem>}
                  {apiPlan.implementation.middleware && <AccordionItem value="middleware">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        Authentication Middleware
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay code={apiPlan.implementation.middleware} language="javascript" />
                      </AccordionContent>
                    </AccordionItem>}
                  {apiPlan.implementation.routes && <AccordionItem value="routes">
                      <AccordionTrigger className="text-sm font-medium text-white">
                        Route Implementation
                      </AccordionTrigger>
                      <AccordionContent>
                        <CodeDisplay code={apiPlan.implementation.routes} language="javascript" />
                      </AccordionContent>
                    </AccordionItem>}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security-deployment" className="mt-0">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Security Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-squadrun-gray">
                    {apiPlan.security.map((item: string, index: number) => <li key={index} className="text-sm">{item}</li>)}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Deployment Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2 text-squadrun-gray">
                    {apiPlan.deployment.map((item: string, index: number) => <li key={index} className="text-sm">{item}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="destructive" 
          className="mr-2" 
          onClick={handleClear}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
        <Button variant="outline" className="text-squadrun-gray mr-2 border-squadrun-primary/20 hover:bg-squadrun-primary/10" onClick={() => setApiPlan(null)}>
          <ChevronsUpDown className="mr-2 h-4 w-4" /> Edit Requirements
        </Button>
        <Button className="bg-squadrun-primary hover:bg-squadrun-vivid text-white">
          <FileDown className="mr-2 h-4 w-4" /> Download API Blueprint
        </Button>
      </div>
    </div>
  );
}
