using System;
using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models
{
    public class Task
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        public bool IsCompleted { get; set; } 
    }
}
