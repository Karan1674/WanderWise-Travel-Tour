🌍 Wandervise (React Version)

📋 Overview

Wandervise is a modern React-based travel agency platform built with a Node.js and Express backend, MongoDB for data management, and Redux for state handling. This project is a rebuild of the original Wandervise version that was made using EJS, now transformed into a React application for a more dynamic and scalable frontend. It offers a smooth client-facing experience where users can browse and book travel packages, apply for careers, submit enquiries, and interact with FAQs. On the management side, it provides a powerful admin and agent dashboard to oversee bookings, packages, enquiries, careers, and users. This version introduces Redux slices for authentication and state management, JWT-based login instead of sessions, and toast messages for feedback, while removing unnecessary modules like blogs, products, galleries, and tour guide features.


✨ Features

🏢 Admin & Agent Dashboard: The admin and agent dashboard provides a comprehensive overview of platform activity, including metrics such as active agents, total users, and package earnings. It centralizes management tasks by allowing admins and agents to view and control bookings, packages, FAQs, contact enquiries, and career applications. The role-based access system ensures secure control, while toast notifications keep users informed of their actions, making the experience smooth and responsive.

👤 Authentication & User Management: Authentication is managed using JWT tokens and Redux slices, ensuring that user, admin, and agent sessions are tracked seamlessly across the application without relying on cookies or server-side sessions. Users can securely log in, log out, and access protected routes, while administrators have full control over agent management, including creating, editing, and deleting accounts. This design improves security and provides a scalable solution for future growth.

🗺️ Package Management: Admins and agents have complete control over travel packages with full CRUD functionality. They can create detailed itineraries, edit or delete packages, and preview listings. On the client side, users can browse a variety of packages, explore detailed information, and filter results to quickly find travel options that meet their preferences. The intuitive design ensures that both admins, agents and users interact with packages effortlessly.

📅 Booking Management: The booking management system integrates with Stripe to handle secure online payments and supports refunds for user convenience. Clients can book packages and view their booking history, while admins and agents can track, confirm, cancel, or update booking statuses in real time. This ensures transparency and reliability in managing travel reservations.

🎟️ Coupon System: The coupon system provides admin with tools to create and manage discount codes. Coupons can be applied as fixed-value or percentage-based discounts and can be configured with expiry dates and usage limits. This feature improves customer engagement by offering promotional offers while giving administrators flexibility in controlling their availability.

💼 Career Module: The career module allows admins and agents to post, update, and delete job openings. Clients can browse career opportunities and apply directly through the system, with applications stored for easy review. This module ensures that the platform doubles as a recruitment tool related to travel Jobs while keeping the process simple and organized.

❓ FAQ & Enquiry Management: The FAQ and enquiry system allows clients to ask questions and submit enquiries via contact forms, while admin and agents can answer, update, and manage them effectively. FAQs can be stored, updated, or removed, ensuring that clients always have access to the most relevant information. Enquiries are tracked with statuses such as pending, active, or cancelled, ensuring timely responses and transparent communication.

➕ Additional Features: Other key features include a wishlist system that allows clients to save packages for future bookings and a review system where users can share feedback on their experiences. Informational pages such as About and Services provide company insights, while a unified 404 route handler ensures smooth navigation. The entire interface is responsive, leveraging modern UI frameworks to deliver an optimized experience across all devices.


🛠️ Tech Stack

🖥️ Frontend: React.js, Redux Toolkit, React Router DOM, React-Toastify, Font Awesome, Jodit Editor, Bootstrap and custom css
🔧 Backend: Node.js, Express.js
🗄️ Database: MongoDB with Mongoose
🔒 Authentication: JWT, bcrypt (password hashing)
💰 Payment Gateway: Stripe

