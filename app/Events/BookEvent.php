<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public bool   $success;
    public string $message;
    public string $action;       // 'create' ou 'reorder'
    public ?array $book;         // données du livre créé, ou null
    public array  $ordered_ids;  // pour le reorder
    public ?string $shelf_id;    // pour savoir quelle étagère mettre à jour

    public function __construct(
        bool $success,
        string $message,
        string $action,
        ?\App\Models\Book $book = null,
        array $ordered_ids = [],
        ?string $shelf_id = null
    ) {
        $this->success     = $success;
        $this->message     = $message;
        $this->action      = $action;
        $this->book        = $book ? $book->toArray() : null;
        $this->ordered_ids = $ordered_ids;
        $this->shelf_id    = $shelf_id;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('reverb');
    }

    public function broadcastWith(): array
    {
        return [
            'success'     => $this->success,
            'message'     => $this->message,
            'action'      => $this->action,
            'book'        => $this->book,
            'ordered_ids' => $this->ordered_ids,
            'shelf_id'    => $this->shelf_id,
        ];
    }
}
