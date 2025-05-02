#!/bin/bash

echo "=== Todo List Application Setup - Part 3: Backend and Database Setup ==="
echo "Creating backend models, controllers, and database setup..."

# Navigate to TodoList directory if not already there
if [ ! -d "TodoList" ]; then
    echo "TodoList directory not found. Please run the base setup script first."
    exit 1
fi

cd TodoList

# Create Models
echo "Creating Model files..."

# Create TodoItem.cs
cat > Models/TodoItem.cs << 'EOF'
using System;
using System.ComponentModel.DataAnnotations;

namespace TodoList.Models
{
    public class TodoItem
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public bool IsComplete { get; set; }
        
        [Required]
        public DateTime CreatedDate { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        [Required]
        public Priority Priority { get; set; }
        
        [Required]
        public int CategoryId { get; set; }
        public Category Category { get; set; }
    }
    
    public enum Priority
    {
        Low,
        Medium,
        High,
        Urgent
    }
}
EOF

# Create Category.cs
cat > Models/Category.cs << 'EOF'
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TodoList.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        public string Color { get; set; }
        
        public List<TodoItem> TodoItems { get; set; }
    }
}
EOF

# Create Database Context
echo "Creating Database Context..."
cat > Data/ApplicationDbContext.cs << 'EOF'
using Microsoft.EntityFrameworkCore;
using TodoList.Models;

namespace TodoList.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<TodoItem> TodoItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed some default categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Work", Color = "#ff6b6b" },
                new Category { Id = 2, Name = "Personal", Color = "#48dbfb" },
                new Category { Id = 3, Name = "Shopping", Color = "#1dd1a1" },
                new Category { Id = 4, Name = "Health", Color = "#5f27cd" }
            );
            
            // Set up relationships
            modelBuilder.Entity<TodoItem>()
                .HasOne(t => t.Category)
                .WithMany(c => c.TodoItems)
                .HasForeignKey(t => t.CategoryId);
        }
    }
}
EOF

# Create Controllers
echo "Creating Controllers..."

# Create TodoItemsController.cs
cat > Controllers/TodoItemsController.cs << 'EOF'
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoList.Data;
using TodoList.Models;

namespace TodoList.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TodoItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/TodoItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
        {
            return await _context.TodoItems
                .Include(t => t.Category)
                .ToListAsync();
        }

        // GET: api/TodoItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
        {
            var todoItem = await _context.TodoItems
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (todoItem == null)
            {
                return NotFound();
            }

            return todoItem;
        }

        // POST: api/TodoItems
        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {
            if (todoItem.CreatedDate == default)
            {
                todoItem.CreatedDate = DateTime.Now;
            }
            
            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, todoItem);
        }

        // PUT: api/TodoItems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(int id, TodoItem todoItem)
        {
            if (id != todoItem.Id)
            {
                return BadRequest();
            }

            _context.Entry(todoItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/TodoItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // PUT: api/TodoItems/5/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteTodoItem(int id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            
            if (todoItem == null)
            {
                return NotFound();
            }
            
            todoItem.IsComplete = true;
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        private bool TodoItemExists(int id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}
EOF

# Create CategoriesController.cs
cat > Controllers/CategoriesController.cs << 'EOF'
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoList.Data;
using TodoList.Models;

namespace TodoList.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {
            if (id != category.Id)
            {
                return BadRequest();
            }

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}
EOF

# Create MySQL database setup script
echo "Creating MySQL setup script..."
cat > db-setup.sql << 'EOF'
-- Create the database
CREATE DATABASE IF NOT EXISTS todolist;
USE todolist;

-- Create Categories table
CREATE TABLE IF NOT EXISTS Categories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Color VARCHAR(50) NULL
);

-- Create TodoItems table
CREATE TABLE IF NOT EXISTS TodoItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Description TEXT NULL,
    IsComplete BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedDate DATETIME NOT NULL,
    DueDate DATETIME NULL,
    Priority INT NOT NULL,
    CategoryId INT NOT NULL,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);

-- Seed initial categories
INSERT INTO Categories (Name, Color) VALUES
    ('Work', '#ff6b6b'),
    ('Personal', '#48dbfb'),
    ('Shopping', '#1dd1a1'),
    ('Health', '#5f27cd');

-- Seed some example